// 화면에서 쓰는 서버 API 호출 모음

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  address?: string;
  salary: string;
  type: string;
  empType?: string;
  education?: string;
  career?: string;
  postedDate?: string;
  closingDate?: string;
  url?: string;
}

export interface JobList {
  total: number;
  items: Job[];
  error?: string;
}

export interface JobDetail {
  id: string;
  fields: { label: string; value: string }[];
}

export type ProgramKind = 'course' | 'event';

export interface Program {
  id: number;
  org_id: number;
  kind: ProgramKind;
  title: string;
  category: string;
  region: string;
  summary: string;
  target: string;
  apply_start: string;
  apply_end: string;
  start_date: string;
  end_date: string;
  schedule: string;
  place: string;
  delivery: '대면' | '온라인' | '혼합';
  cost_type: '무료' | '국비지원' | '유료';
  cost_detail: string;
  capacity: string;
  related_jobs: string;
  contact: string;
  apply_url: string;
  visible: number;
  updated_at?: string;
  org_name?: string;
  org_homepage?: string;
  org_phone?: string;
}

export interface Org {
  id: number;
  login_id: string;
  name: string;
  org_type: string;
  region: string;
  manager: string;
  phone: string;
  email: string;
  homepage: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  created_at?: string;
  approved_at?: string | null;
  program_count?: number;
}

export interface CounselingRequest {
  id: number;
  center: string;
  name: string;
  phone: string;
  topic: string;
  method: string;
  preferred_time: string;
  message: string;
  profile_summary: string;
  status: 'new' | 'contacted' | 'done';
  created_at: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit & { body?: string }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      credentials: 'same-origin',
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json', ...init?.headers } : init?.headers,
    });
  } catch {
    throw new ApiError('인터넷 연결을 확인해 주세요.', 0);
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // 응답 본문이 JSON이 아님
  }
  const err = (data as { error?: string } | null)?.error;
  if (!res.ok || err) throw new ApiError(err || `요청을 처리하지 못했습니다 (HTTP ${res.status})`, res.status);
  return data as T;
}

const get = <T,>(path: string) => request<T>(path);
const post = <T,>(path: string, body: unknown, method = 'POST') => request<T>(path, { method, body: JSON.stringify(body) });

// 일자리
export function fetchJobs(opts: { keyword?: string; region?: string; display?: number; startPage?: number } = {}) {
  const q = new URLSearchParams();
  if (opts.display) q.set('display', String(opts.display));
  if (opts.startPage) q.set('startPage', String(opts.startPage));
  if (opts.keyword) q.set('keyword', opts.keyword);
  if (opts.region && opts.region !== '전체') q.set('region', opts.region);
  return get<JobList>(`/api/jobs?${q}`);
}
export const fetchJobDetail = (id: string) => get<JobDetail>(`/api/jobs/${encodeURIComponent(id)}`);

// 교육과정 · 채용행사 (공개)
export const fetchPrograms = (kind: ProgramKind) => get<{ items: Program[] }>(`/api/programs?kind=${kind}`);

// 상담 신청
export const submitCounseling = (body: Record<string, unknown>) => post<{ ok: true }>('/api/counseling', body);

// 방문자 수 · AI
export const fetchVisit = () => get<{ count: number | null }>('/api/visit');
export const askChat = (message: string, history: { role: string; text: string }[]) =>
  post<{ reply?: string }>('/api/chat', { message, history });

// 기관
export const orgApi = {
  register: (body: Record<string, unknown>) => post<{ ok: true }>('/api/org/register', body),
  login: (login_id: string, password: string) => post<{ ok: true }>('/api/org/login', { login_id, password }),
  logout: () => post<{ ok: true }>('/api/org/logout', {}),
  me: () => get<{ org: Org }>('/api/org/me'),
  programs: () => get<{ items: Program[] }>('/api/org/programs'),
  create: (p: Partial<Program>) => post<{ ok: true }>('/api/org/programs', p),
  update: (id: number, p: Partial<Program>) => post<{ ok: true }>(`/api/org/programs/${id}`, p, 'PUT'),
  remove: (id: number) => request<{ ok: true }>(`/api/org/programs/${id}`, { method: 'DELETE' }),
};

// 센터 관리자
export const adminApi = {
  login: (password: string) => post<{ ok: true }>('/api/admin/login', { password }),
  logout: () => post<{ ok: true }>('/api/admin/logout', {}),
  me: () => get<{ ok: true }>('/api/admin/me'),
  orgs: () => get<{ items: Org[] }>('/api/admin/orgs'),
  setOrgStatus: (id: number, status: Org['status'], note = '') => post<{ ok: true }>(`/api/admin/orgs/${id}/status`, { status, note }),
  programs: () => get<{ items: (Pick<Program, 'id' | 'kind' | 'title' | 'start_date' | 'end_date' | 'visible' | 'updated_at'> & { org_name: string })[] }>('/api/admin/programs'),
  setProgramVisible: (id: number, visible: boolean) => post<{ ok: true }>(`/api/admin/programs/${id}/visibility`, { visible }),
  counseling: () => get<{ items: CounselingRequest[] }>('/api/admin/counseling'),
  setCounselingStatus: (id: number, status: CounselingRequest['status']) => post<{ ok: true }>(`/api/admin/counseling/${id}/status`, { status }),
};
