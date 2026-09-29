// 공고 제목으로 직종을 나누고, 중장년이 꼭 확인하는 조건을 뽑아내는 규칙

import type { Job } from '../api';

export const JOB_CATEGORIES: { name: string; keywords: string[] }[] = [
  { name: '요양보호사·간병·간호', keywords: ['요양보호사', '요양', '간병', '간호조무사', '간호사', '재가복지', '주간보호', '돌봄'] },
  { name: '경비·시설관리', keywords: ['경비', '시설관리', '보안', '방재', '전기안전', '설비', '기전', '당직'] },
  { name: '주택관리(관리소장)', keywords: ['관리소장', '주택관리', '아파트관리', '건물관리'] },
  { name: '청소·미화', keywords: ['청소', '미화원', '미화', '환경미화'] },
  { name: '조리·주방', keywords: ['조리', '주방', '식당', '급식', '조리사', '조리원'] },
  { name: '운전·배송', keywords: ['운전', '배송', '택배', '기사', '대리운전', '퀵서비스', '지게차'] },
  { name: '사무·행정', keywords: ['사무', '행정', '경리', '총무', '회계', '비서', '접수'] },
  { name: '생산·제조', keywords: ['생산직', '생산', '제조', '조립', '포장', '검사원', '공정', '미싱'] },
  { name: '판매·영업', keywords: ['판매', '매장', '영업', '캐셔', '카운터'] },
  { name: '교육·강사', keywords: ['강사', '교사', '방과후', '학원'] },
  { name: '상담·고객서비스', keywords: ['상담', '콜센터', '텔레마케터', 'CS'] },
];

export const OTHER_CATEGORY = '기타';

export function classifyJob(title: string): string {
  const t = (title || '').replace(/\s/g, '');
  for (const c of JOB_CATEGORIES) if (c.keywords.some((k) => t.includes(k))) return c.name;
  return OTHER_CATEGORY;
}

export function groupByCategory(jobs: Job[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const j of jobs) {
    const c = classifyJob(j.title);
    map.set(c, (map.get(c) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (a.name === OTHER_CATEGORY ? 1 : b.name === OTHER_CATEGORY ? -1 : b.count - a.count));
}

// 제목에서 읽어낼 수 있는 핵심 조건 (교대·야간·자격 등)
const TITLE_TAGS: { label: string; tone: 'warn' | 'info' | 'good'; test: RegExp }[] = [
  { label: '3교대', tone: 'warn', test: /3교대/ },
  { label: '2교대', tone: 'warn', test: /2교대|주야/ },
  { label: '격일제', tone: 'warn', test: /격일/ },
  { label: '교대근무', tone: 'warn', test: /(?<![23])교대/ },
  { label: '야간', tone: 'warn', test: /야간|심야/ },
  { label: '주말근무', tone: 'warn', test: /주말|토요일|일요일/ },
  { label: '입주', tone: 'info', test: /입주/ },
  { label: '재가(방문)', tone: 'info', test: /재가|방문요양/ },
  { label: '시설근무', tone: 'info', test: /요양원|주간보호|시설/ },
  { label: '단시간', tone: 'info', test: /단시간|파트|시간제|알바|\d+시간/ },
  { label: '요양보호사 자격', tone: 'info', test: /요양보호사/ },
  { label: '경비신임교육', tone: 'info', test: /경비/ },
  { label: '주택관리사 자격', tone: 'info', test: /관리소장|주택관리사/ },
  { label: '운전면허', tone: 'info', test: /운전|기사|배송/ },
  { label: '초보 가능', tone: 'good', test: /초보|무경력|경력무관|누구나/ },
  { label: '중장년·시니어 우대', tone: 'good', test: /시니어|중장년|어르신|6\d세|5\d세|장년/ },
];

export function titleTags(title: string) {
  const out: { label: string; tone: 'warn' | 'info' | 'good' }[] = [];
  for (const t of TITLE_TAGS) {
    if (t.test.test(title) && !out.some((o) => o.label === t.label)) out.push({ label: t.label, tone: t.tone });
  }
  // "교대근무"는 3교대/2교대가 이미 있으면 뺍니다.
  if (out.some((o) => o.label === '3교대' || o.label === '2교대')) return out.filter((o) => o.label !== '교대근무');
  return out;
}

export function isCareerFree(job: Job) {
  return !job.career || /관계없음|무관|신입/.test(job.career);
}

export function isEducationFree(job: Job) {
  return !job.education || /무관/.test(job.education);
}

// "26-10-05", "채용시까지 26-11-28" 등에서 마감일을 뽑아 남은 일수를 구합니다.
export function daysLeft(closing?: string): number | null {
  const m = /(\d{2,4})-(\d{1,2})-(\d{1,2})/.exec(closing || '');
  if (!m) return null;
  const year = m[1].length === 2 ? 2000 + Number(m[1]) : Number(m[1]);
  const end = new Date(year, Number(m[2]) - 1, Number(m[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86400_000);
}
