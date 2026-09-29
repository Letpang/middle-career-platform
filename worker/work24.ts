// 고용24(워크넷) 채용정보 오픈API 연동
// 목록: callOpenApiSvcInfo210L01 / 상세: callOpenApiSvcInfo210D01 (XML 응답)

import type { Env } from './index';

const LIST_URL = 'https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do';
const DETAIL_URL = 'https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210D01.do';
const CACHE_SECONDS = 20 * 60;

// 지역 버튼 → 고용24 지역코드. 코드가 맞지 않을 경우를 대비해 주소 문자열로 한 번 더 거릅니다.
// 고용24는 쉼표로 여러 코드를 묶어 조회하지 못합니다. 고양시 통합 코드(41280)가 3개 구 공고를 모두 포함합니다.
const REGION_CODES: Record<string, string[][]> = {
  고양: [['41280']],
  파주: [['41480']],
  김포: [['41570']],
};

// 고용24 고용형태 코드
const EMP_TYPES: Record<string, string> = {
  '10': '정규직',
  '11': '정규직(시간선택제)',
  '20': '계약직',
  '21': '계약직(시간선택제)',
  '4': '파견근로',
  '3': '대체인력',
};

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  address: string;
  salary: string;
  type: string;
  empType: string;
  education: string;
  career: string;
  postedDate: string;
  closingDate: string;
  url: string;
}

export class Work24Error extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

// 기존 사이트에서 쓰던 비밀값 이름이 무엇이든 찾아 쓰도록 여러 이름을 확인합니다.
function getApiKey(env: Env): string {
  const e = env as unknown as Record<string, unknown>;
  for (const name of ['WORK24_API_KEY', 'WORK24_KEY', 'WORKNET_API_KEY', 'WORKNET_KEY', 'GOYONG24_API_KEY', 'EMPLOYMENT_API_KEY', 'API_KEY']) {
    const v = e[name];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  throw new Work24Error('고용24 인증키가 설정되지 않았습니다. (WORK24_API_KEY)', 500);
}

// 고용24 응답 일부는 &가 두 번 이스케이프되어 "&amp;amp;", "&amp;#39;"처럼 옵니다.
// &amp;를 먼저 풀어야 나머지 기호가 남지 않습니다.
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// 하위 태그가 없는 단순 태그만 key → value 로 모읍니다.
function leafTags(xml: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /<([A-Za-z][\w]*)>((?:(?!<[A-Za-z])[\s\S])*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    if (!(m[1] in out)) out[m[1]] = decodeEntities(m[2]);
  }
  return out;
}

async function fetchXml(url: string): Promise<string> {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 700 * attempt));
    try {
      const res = await fetch(url, { headers: { Accept: 'application/xml' } });
      lastStatus = res.status;
      if (res.ok) {
        const text = await res.text();
        const err = /<error>([\s\S]*?)<\/error>/.exec(text);
        if (err) throw new Work24Error(`고용24 응답 오류: ${decodeEntities(err[1])}`, 502);
        return text;
      }
      if (res.status < 500) break;
    } catch (e) {
      if (e instanceof Work24Error) throw e;
    }
  }
  throw new Work24Error(`고용24 서버가 응답하지 않습니다${lastStatus ? ` (HTTP ${lastStatus})` : ''}. 잠시 후 다시 시도해 주세요.`, 502);
}

function toJob(t: Record<string, string>): JobItem {
  const id = t.wantedAuthNo || '';
  const salary = [t.salTpNm, t.sal].filter(Boolean).join(' ');
  return {
    id,
    title: t.title || '',
    company: t.company || '',
    location: t.region || '',
    address: [t.basicAddr, t.detailAddr].filter(Boolean).join(' '),
    salary: salary || '급여 협의',
    type: t.holidayTpNm || '근무형태 미제공',
    empType: EMP_TYPES[t.empTpCd] || '',
    education: t.minEdubg || '',
    career: t.career || '',
    postedDate: t.regDt || '',
    closingDate: t.closeDt || '',
    url:
      t.wantedInfoUrl ||
      (id
        ? `https://www.work24.go.kr/wk/a/b/1500/empDetailAuthView.do?wantedAuthNo=${id}&infoTypeCd=VALIDATION&infoTypeGroup=tb_workinfoworknet`
        : ''),
  };
}

async function fetchListPage(key: string, params: Record<string, string>): Promise<{ total: number; items: JobItem[] }> {
  const qs = new URLSearchParams({ authKey: key, callTp: 'L', returnType: 'XML', ...params });
  const xml = await fetchXml(`${LIST_URL}?${qs}`);
  const total = Number(/<total>(\d+)<\/total>/.exec(xml)?.[1] || 0);
  const items: JobItem[] = [];
  const re = /<wanted>([\s\S]*?)<\/wanted>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) items.push(toJob(leafTags(m[1])));
  return { total, items };
}

async function cached<T>(cacheKey: string, ctx: ExecutionContext, load: () => Promise<T>): Promise<T> {
  const cache = caches.default;
  const req = new Request(`https://cache.career-bridge.internal/${encodeURIComponent(cacheKey)}`);
  const hit = await cache.match(req);
  if (hit) return (await hit.json()) as T;
  const data = await load();
  ctx.waitUntil(
    cache.put(req, new Response(JSON.stringify(data), { headers: { 'Cache-Control': `max-age=${CACHE_SECONDS}` } })),
  );
  return data;
}

// 일반 목록 (전국, 키워드 검색)
export async function listJobs(
  env: Env,
  ctx: ExecutionContext,
  opts: { keyword?: string; startPage?: number; display?: number },
) {
  const key = getApiKey(env);
  const display = Math.min(Math.max(opts.display || 30, 1), 100);
  const startPage = Math.min(Math.max(opts.startPage || 1, 1), 1000);
  const keyword = (opts.keyword || '').trim().slice(0, 50);
  const params: Record<string, string> = { startPage: String(startPage), display: String(display) };
  if (keyword) params.keyword = keyword;
  return cached(`list:${keyword}:${startPage}:${display}`, ctx, () => fetchListPage(key, params));
}

// 지역 전체 목록 (고양·파주·김포). 한 번에 모두 받아 두고 화면에서 키워드·직종으로 거릅니다.
export async function listRegionJobs(env: Env, ctx: ExecutionContext, region: string) {
  const key = getApiKey(env);
  const codeSets = REGION_CODES[region];
  if (!codeSets) throw new Work24Error('지원하지 않는 지역입니다.', 400);

  return cached(`region:${region}`, ctx, async () => {
    for (const codes of codeSets) {
      const first = await fetchListPage(key, { region: codes.join(','), startPage: '1', display: '100' });
      const pages = Math.min(Math.ceil(first.total / 100), 12);
      const rest = await Promise.all(
        Array.from({ length: Math.max(pages - 1, 0) }, (_, i) =>
          fetchListPage(key, { region: codes.join(','), startPage: String(i + 2), display: '100' }).catch(() => ({ total: 0, items: [] as JobItem[] })),
        ),
      );
      const all = [first, ...rest].flatMap((p) => p.items).filter((j) => j.location.includes(region) || j.address.includes(region));
      if (all.length > 0) {
        const unique = Array.from(new Map(all.map((j) => [j.id, j])).values());
        return { total: unique.length, items: unique };
      }
    }
    return { total: 0, items: [] as JobItem[] };
  });
}

// 상세 조건 (카드의 "상세 조건 펼치기")
const DETAIL_LABELS: [string, string][] = [
  ['jobCont', '하는 일'],
  ['workdayWorkhrCont', '근무 요일·시간'],
  ['empTpNm', '고용형태'],
  ['salTpNm', '임금'],
  ['collectPsncnt', '모집 인원'],
  ['enterTpNm', '경력 조건'],
  ['eduNm', '학력'],
  ['certificate', '필요 자격·면허'],
  ['compAbl', '컴퓨터 활용'],
  ['pfCond', '우대 조건'],
  ['etcPfCond', '기타 우대'],
  ['workRegion', '근무 장소'],
  ['nearLine', '가까운 역'],
  ['fourIns', '4대 보험'],
  ['retirepay', '퇴직금'],
  ['etcWelfare', '복리후생'],
  ['selMthd', '전형 방법'],
  ['rcptMthd', '접수 방법'],
  ['submitDoc', '제출 서류'],
  ['receiptCloseDt', '접수 마감'],
  ['etcHopeCont', '기타 안내'],
  ['corpNm', '회사명'],
  ['busiSize', '기업 규모'],
  ['indTpCdNm', '업종'],
  ['totPsncnt', '근로자 수'],
  ['corpAddr', '회사 주소'],
];

export async function getJobDetail(env: Env, ctx: ExecutionContext, id: string) {
  if (!/^[A-Za-z0-9]{6,30}$/.test(id)) throw new Work24Error('잘못된 공고 번호입니다.', 400);
  const key = getApiKey(env);
  return cached(`detail:${id}`, ctx, async () => {
    const qs = new URLSearchParams({ authKey: key, callTp: 'D', returnType: 'XML', infoSvc: 'VALIDATION', wantedAuthNo: id });
    const t = leafTags(await fetchXml(`${DETAIL_URL}?${qs}`));
    const fields = DETAIL_LABELS.filter(([k]) => t[k] && t[k] !== '-').map(([k, label]) => ({ label, value: t[k] }));
    return { id, fields };
  });
}
