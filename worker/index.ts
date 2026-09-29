// 커리어 브릿지 API 서버 (Cloudflare Worker)
// /api/* 요청만 이 코드로 오고, 나머지는 빌드된 화면(dist)이 응답합니다.

import { listJobs, listRegionJobs, getJobDetail, Work24Error } from './work24';
import { hashPassword, verifyPassword, verifyAdminPassword, createSession, getSession, destroySession } from './auth';

export interface Env {
  DB: D1Database;
  AI: Ai;
  ASSETS: Fetcher;
  WORK24_API_KEY?: string;
  ADMIN_PASSWORD?: string;
  GOOGLE_API_KEY?: string;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new HttpError(400, '요청 형식이 올바르지 않습니다.');
}

function str(body: Record<string, unknown>, key: string, max = 500, required = false, label = key): string {
  const v = body[key];
  const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
  if (required && !s) throw new HttpError(400, `${label}을(를) 입력해 주세요.`);
  if (s.length > max) throw new HttpError(400, `${label}은(는) ${max}자 이내로 입력해 주세요.`);
  return s;
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function dateStr(body: Record<string, unknown>, key: string): string {
  const s = str(body, key, 10);
  if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new HttpError(400, '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.');
  return s;
}

function urlStr(body: Record<string, unknown>, key: string, label: string): string {
  const s = str(body, key, 500, false, label);
  if (s && !/^https?:\/\/[^\s]+$/i.test(s)) throw new HttpError(400, `${label}은(는) http:// 또는 https:// 로 시작하는 주소여야 합니다.`);
  return s;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('Origin');
  return !origin || origin === new URL(req.url).origin;
}

// ─── 교육과정 · 채용행사 ─────────────────────────────────────

const PROGRAM_KINDS = ['course', 'event'] as const;
const DELIVERY = ['대면', '온라인', '혼합'] as const;
const COST_TYPES = ['무료', '국비지원', '유료'] as const;

function readProgram(body: Record<string, unknown>) {
  const p = {
    kind: oneOf(str(body, 'kind', 10), PROGRAM_KINDS, 'course'),
    title: str(body, 'title', 120, true, '제목'),
    category: str(body, 'category', 40),
    region: str(body, 'region', 40),
    summary: str(body, 'summary', 2000, true, '소개'),
    target: str(body, 'target', 200),
    apply_start: dateStr(body, 'apply_start'),
    apply_end: dateStr(body, 'apply_end'),
    start_date: dateStr(body, 'start_date'),
    end_date: dateStr(body, 'end_date'),
    schedule: str(body, 'schedule', 200),
    place: str(body, 'place', 200),
    delivery: oneOf(str(body, 'delivery', 10), DELIVERY, '대면'),
    cost_type: oneOf(str(body, 'cost_type', 10), COST_TYPES, '무료'),
    cost_detail: str(body, 'cost_detail', 200),
    capacity: str(body, 'capacity', 50),
    related_jobs: str(body, 'related_jobs', 300),
    contact: str(body, 'contact', 100),
    apply_url: urlStr(body, 'apply_url', '신청 주소'),
    visible: body.visible === false || body.visible === 0 ? 0 : 1,
  };
  if (!p.start_date) throw new HttpError(400, p.kind === 'event' ? '행사 날짜를 입력해 주세요.' : '교육 시작일을 입력해 주세요.');
  if (p.end_date && p.end_date < p.start_date) throw new HttpError(400, '종료일이 시작일보다 빠릅니다.');
  if (p.apply_start && p.apply_end && p.apply_end < p.apply_start) throw new HttpError(400, '접수 마감일이 접수 시작일보다 빠릅니다.');
  return p;
}

const PROGRAM_COLS = [
  'kind', 'title', 'category', 'region', 'summary', 'target', 'apply_start', 'apply_end', 'start_date', 'end_date',
  'schedule', 'place', 'delivery', 'cost_type', 'cost_detail', 'capacity', 'related_jobs', 'contact', 'apply_url', 'visible',
] as const;

async function publicPrograms(env: Env, url: URL) {
  const kind = oneOf(url.searchParams.get('kind') || '', PROGRAM_KINDS, 'course');
  // 끝난 지 30일 넘은 항목은 숨깁니다.
  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const { results } = await env.DB.prepare(
    `SELECT p.*, o.name AS org_name, o.homepage AS org_homepage, o.phone AS org_phone
       FROM programs p JOIN orgs o ON o.id = p.org_id
      WHERE p.kind = ? AND p.visible = 1 AND o.status = 'approved'
        AND COALESCE(NULLIF(p.end_date, ''), p.start_date) >= ?
      ORDER BY p.start_date ASC LIMIT 300`,
  )
    .bind(kind, cutoff)
    .all();
  return json({ items: results });
}

// ─── 기관 ─────────────────────────────────────────────

async function requireOrg(env: Env, req: Request) {
  const s = await getSession(env, req, 'org');
  if (!s || s.orgId == null) throw new HttpError(401, '기관 로그인이 필요합니다.');
  const org = await env.DB.prepare(
    'SELECT id, login_id, name, org_type, region, manager, phone, email, homepage, status, admin_note FROM orgs WHERE id = ?',
  )
    .bind(s.orgId)
    .first<{ id: number; status: string } & Record<string, unknown>>();
  if (!org) throw new HttpError(401, '기관 로그인이 필요합니다.');
  return org;
}

async function orgRoutes(env: Env, req: Request, path: string): Promise<Response | null> {
  const method = req.method;

  if (path === '/api/org/register' && method === 'POST') {
    const b = await readBody(req);
    const loginId = str(b, 'login_id', 30, true, '아이디').toLowerCase();
    if (!/^[a-z0-9_.-]{4,30}$/.test(loginId)) throw new HttpError(400, '아이디는 영문 소문자·숫자 4~30자로 입력해 주세요.');
    const password = str(b, 'password', 100, true, '비밀번호');
    if (password.length < 8) throw new HttpError(400, '비밀번호는 8자 이상으로 입력해 주세요.');
    const org = {
      name: str(b, 'name', 80, true, '기관명'),
      org_type: str(b, 'org_type', 40),
      region: str(b, 'region', 40),
      manager: str(b, 'manager', 40, true, '담당자 이름'),
      phone: str(b, 'phone', 40, true, '연락처'),
      email: str(b, 'email', 100),
      homepage: urlStr(b, 'homepage', '홈페이지'),
    };
    const exists = await env.DB.prepare('SELECT 1 FROM orgs WHERE login_id = ?').bind(loginId).first();
    if (exists) throw new HttpError(409, '이미 사용 중인 아이디입니다.');
    const { hash, salt } = await hashPassword(password);
    await env.DB.prepare(
      `INSERT INTO orgs (login_id, pw_hash, pw_salt, name, org_type, region, manager, phone, email, homepage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(loginId, hash, salt, org.name, org.org_type, org.region, org.manager, org.phone, org.email, org.homepage)
      .run();
    return json({ ok: true });
  }

  if (path === '/api/org/login' && method === 'POST') {
    const b = await readBody(req);
    const loginId = str(b, 'login_id', 30, true, '아이디').toLowerCase();
    const password = str(b, 'password', 100, true, '비밀번호');
    const row = await env.DB.prepare('SELECT id, pw_hash, pw_salt FROM orgs WHERE login_id = ?')
      .bind(loginId)
      .first<{ id: number; pw_hash: string; pw_salt: string }>();
    if (!row || !(await verifyPassword(password, row.pw_hash, row.pw_salt))) {
      await new Promise((r) => setTimeout(r, 600));
      throw new HttpError(401, '아이디 또는 비밀번호가 맞지 않습니다.');
    }
    const cookie = await createSession(env, 'org', row.id);
    return json({ ok: true }, 200, { 'Set-Cookie': cookie });
  }

  if (path === '/api/org/logout' && method === 'POST') {
    return json({ ok: true }, 200, { 'Set-Cookie': await destroySession(env, req, 'org') });
  }

  if (path === '/api/org/me' && method === 'GET') {
    return json({ org: await requireOrg(env, req) });
  }

  if (path === '/api/org/programs' && method === 'GET') {
    const org = await requireOrg(env, req);
    const { results } = await env.DB.prepare('SELECT * FROM programs WHERE org_id = ? ORDER BY start_date DESC, id DESC')
      .bind(org.id)
      .all();
    return json({ items: results });
  }

  if (path === '/api/org/programs' && method === 'POST') {
    const org = await requireOrg(env, req);
    if (org.status !== 'approved') throw new HttpError(403, '관리자 승인 후에 등록할 수 있습니다.');
    const p = readProgram(await readBody(req));
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM programs WHERE org_id = ?').bind(org.id).first<{ n: number }>();
    if ((count?.n || 0) >= 500) throw new HttpError(400, '등록 가능한 개수를 넘었습니다. 지난 항목을 정리해 주세요.');
    await env.DB.prepare(
      `INSERT INTO programs (org_id, ${PROGRAM_COLS.join(', ')}) VALUES (?, ${PROGRAM_COLS.map(() => '?').join(', ')})`,
    )
      .bind(org.id, ...PROGRAM_COLS.map((c) => p[c]))
      .run();
    return json({ ok: true });
  }

  const m = /^\/api\/org\/programs\/(\d+)$/.exec(path);
  if (m && (method === 'PUT' || method === 'DELETE')) {
    const org = await requireOrg(env, req);
    if (org.status !== 'approved') throw new HttpError(403, '관리자 승인 후에 수정할 수 있습니다.');
    const id = Number(m[1]);
    const owned = await env.DB.prepare('SELECT 1 FROM programs WHERE id = ? AND org_id = ?').bind(id, org.id).first();
    if (!owned) throw new HttpError(404, '항목을 찾을 수 없습니다.');
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM programs WHERE id = ? AND org_id = ?').bind(id, org.id).run();
      return json({ ok: true });
    }
    const p = readProgram(await readBody(req));
    await env.DB.prepare(
      `UPDATE programs SET ${PROGRAM_COLS.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ? AND org_id = ?`,
    )
      .bind(...PROGRAM_COLS.map((c) => p[c]), id, org.id)
      .run();
    return json({ ok: true });
  }

  return null;
}

// ─── 센터 관리자 ─────────────────────────────────────────

async function requireAdmin(env: Env, req: Request) {
  const s = await getSession(env, req, 'admin');
  if (!s) throw new HttpError(401, '관리자 로그인이 필요합니다.');
}

async function adminRoutes(env: Env, req: Request, path: string): Promise<Response | null> {
  const method = req.method;

  if (path === '/api/admin/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) throw new HttpError(500, '관리자 비밀번호(ADMIN_PASSWORD)가 설정되지 않았습니다.');
    const b = await readBody(req);
    if (!(await verifyAdminPassword(env, str(b, 'password', 200, true, '비밀번호')))) {
      await new Promise((r) => setTimeout(r, 800));
      throw new HttpError(401, '비밀번호가 맞지 않습니다.');
    }
    return json({ ok: true }, 200, { 'Set-Cookie': await createSession(env, 'admin', null) });
  }

  if (path === '/api/admin/logout' && method === 'POST') {
    return json({ ok: true }, 200, { 'Set-Cookie': await destroySession(env, req, 'admin') });
  }

  if (!path.startsWith('/api/admin/')) return null;
  await requireAdmin(env, req);

  if (path === '/api/admin/me' && method === 'GET') return json({ ok: true });

  if (path === '/api/admin/orgs' && method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT o.id, o.login_id, o.name, o.org_type, o.region, o.manager, o.phone, o.email, o.homepage, o.status, o.admin_note,
              o.created_at, o.approved_at, (SELECT COUNT(*) FROM programs p WHERE p.org_id = o.id) AS program_count
         FROM orgs o ORDER BY CASE o.status WHEN 'pending' THEN 0 ELSE 1 END, o.created_at DESC`,
    ).all();
    return json({ items: results });
  }

  let m = /^\/api\/admin\/orgs\/(\d+)\/status$/.exec(path);
  if (m && method === 'POST') {
    const b = await readBody(req);
    const status = oneOf(str(b, 'status', 20), ['pending', 'approved', 'rejected'] as const, 'pending');
    const note = str(b, 'note', 300);
    await env.DB.prepare(
      `UPDATE orgs SET status = ?, admin_note = ?, approved_at = CASE WHEN ? = 'approved' THEN datetime('now') ELSE approved_at END WHERE id = ?`,
    )
      .bind(status, note, status, Number(m[1]))
      .run();
    return json({ ok: true });
  }

  if (path === '/api/admin/programs' && method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT p.id, p.kind, p.title, p.start_date, p.end_date, p.visible, p.updated_at, o.name AS org_name
         FROM programs p JOIN orgs o ON o.id = p.org_id ORDER BY p.updated_at DESC LIMIT 500`,
    ).all();
    return json({ items: results });
  }

  m = /^\/api\/admin\/programs\/(\d+)\/visibility$/.exec(path);
  if (m && method === 'POST') {
    const b = await readBody(req);
    await env.DB.prepare('UPDATE programs SET visible = ? WHERE id = ?').bind(b.visible ? 1 : 0, Number(m[1])).run();
    return json({ ok: true });
  }

  if (path === '/api/admin/counseling' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM counseling_requests ORDER BY id DESC LIMIT 500').all();
    return json({ items: results });
  }

  m = /^\/api\/admin\/counseling\/(\d+)\/status$/.exec(path);
  if (m && method === 'POST') {
    const b = await readBody(req);
    const status = oneOf(str(b, 'status', 20), ['new', 'contacted', 'done'] as const, 'new');
    await env.DB.prepare('UPDATE counseling_requests SET status = ? WHERE id = ?').bind(status, Number(m[1])).run();
    return json({ ok: true });
  }

  return null;
}

// ─── 상담 신청 ───────────────────────────────────────────

const COUNSEL_METHODS = ['전화상담', '방문상담'] as const;
const CENTERS = ['고양', '파주'] as const;

async function createCounseling(env: Env, req: Request) {
  const b = await readBody(req);
  if (b.consent !== true) throw new HttpError(400, '개인정보 수집·이용에 동의해 주세요.');
  const method = oneOf(str(b, 'method', 10), COUNSEL_METHODS, '전화상담');
  const profileSummary = str(b, 'profile_summary', 3000);
  if (method === '전화상담' && profileSummary.length < 10) {
    throw new HttpError(400, '전화상담은 프로필에 경력 사항을 먼저 작성한 뒤 신청할 수 있습니다.');
  }
  const phone = str(b, 'phone', 30, true, '연락처');
  if (!/^[0-9-+() ]{8,20}$/.test(phone)) throw new HttpError(400, '연락처를 숫자로 정확히 입력해 주세요.');
  await env.DB.prepare(
    `INSERT INTO counseling_requests (center, name, phone, topic, method, preferred_time, message, profile_summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      oneOf(str(b, 'center', 10), CENTERS, '파주'),
      str(b, 'name', 40, true, '이름'),
      phone,
      str(b, 'topic', 60),
      method,
      str(b, 'preferred_time', 100),
      str(b, 'message', 2000),
      profileSummary,
    )
    .run();
  return json({ ok: true });
}

// ─── AI 질문창 ───────────────────────────────────────────

const CHAT_SYSTEM = `당신은 중장년(4060세대) 재취업 지원 사이트 "커리어 브릿지"의 안내 도우미입니다.
- 항상 한국어로, 쉽고 공손하게, 5문장 이내로 답합니다.
- 사이트 메뉴: 일자리(고용24 실시간 채용정보, 고양·파주·김포 지역별·직종별 보기, 채용행사 달력), 교육(기관이 직접 등록한 교육과정과 지역 평생교육 기관 안내), 상담지원(전화·방문 상담 신청), 프로필(이력 정리와 맞춤 추천).
- 상담 문의: 고양상공회의소 중장년내일센터 031-901-9197, 파주상공회의소 중장년내일센터 031-8071-4245.
- 특정 공고의 합격 여부, 법률·의료 판단은 하지 말고 센터 상담을 권합니다. 모르는 사실은 지어내지 않습니다.`;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

// 기존 사이트에서 쓰던 Google Gemini (비밀값 GOOGLE_API_KEY)
async function askGemini(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n') }] },
      contents: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.6, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

// GOOGLE_API_KEY가 없으면 Cloudflare Workers AI 사용
async function askWorkersAi(env: Env, messages: ChatMessage[]): Promise<string> {
  const ai = env.AI as unknown as { run: (model: string, input: unknown) => Promise<{ response?: string }> };
  const out = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 500 });
  return out.response || '';
}

async function chat(env: Env, req: Request) {
  const b = await readBody(req);
  const message = str(b, 'message', 500, true, '질문');
  const history = Array.isArray(b.history) ? b.history.slice(-6) : [];
  const messages: ChatMessage[] = [{ role: 'system', content: CHAT_SYSTEM }];
  for (const h of history) {
    if (h && typeof h === 'object') {
      const role = (h as { role?: unknown }).role;
      const text = (h as { text?: unknown }).text;
      if ((role === 'user' || role === 'assistant') && typeof text === 'string') messages.push({ role, content: text.slice(0, 1000) });
    }
  }
  messages.push({ role: 'user', content: message });
  try {
    const reply = env.GOOGLE_API_KEY ? await askGemini(env.GOOGLE_API_KEY, messages) : await askWorkersAi(env, messages);
    return json({ reply: reply.trim() || '죄송합니다. 다시 한 번 질문해 주세요.' });
  } catch (e) {
    console.error('chat failed', e);
    return json({ error: 'AI 도우미가 잠시 응답하지 않습니다. 센터로 전화 주시면 바로 안내해 드립니다.' }, 503);
  }
}

// ─── 라우터 ─────────────────────────────────────────────

async function handleApi(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');

  if (req.method !== 'GET' && !sameOrigin(req)) throw new HttpError(403, '허용되지 않은 요청입니다.');

  if (path === '/api/jobs' && req.method === 'GET') {
    const region = url.searchParams.get('region') || url.searchParams.get('regionKeyword') || '';
    if (region && region !== '전체') return json(await listRegionJobs(env, ctx, region));
    return json(
      await listJobs(env, ctx, {
        keyword: url.searchParams.get('keyword') || undefined,
        startPage: Number(url.searchParams.get('startPage')) || 1,
        display: Number(url.searchParams.get('display')) || 30,
      }),
    );
  }

  const jobMatch = /^\/api\/jobs\/([A-Za-z0-9]+)$/.exec(path);
  if (jobMatch && req.method === 'GET') return json(await getJobDetail(env, ctx, jobMatch[1]));

  if (path === '/api/visit' && req.method === 'GET') {
    const row = await env.DB.prepare(`UPDATE counters SET value = value + 1 WHERE name = 'visits' RETURNING value`).first<{ value: number }>();
    return json({ count: row?.value ?? null });
  }

  if (path === '/api/programs' && req.method === 'GET') return publicPrograms(env, url);
  if (path === '/api/counseling' && req.method === 'POST') return createCounseling(env, req);
  if (path === '/api/chat' && req.method === 'POST') return chat(env, req);

  const orgRes = path.startsWith('/api/org/') ? await orgRoutes(env, req, path) : null;
  if (orgRes) return orgRes;
  const adminRes = path.startsWith('/api/admin/') ? await adminRoutes(env, req, path) : null;
  if (adminRes) return adminRes;

  throw new HttpError(404, '요청한 기능을 찾을 수 없습니다.');
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try {
      return await handleApi(req, env, ctx);
    } catch (e) {
      if (e instanceof HttpError || e instanceof Work24Error) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
