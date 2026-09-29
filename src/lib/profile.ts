// 프로필은 서버에 보내지 않고 이 브라우저에만 저장합니다.
// (센터 PC에서 상담사가 가상의 인물로 입력해 추천을 확인하는 용도로도 쓸 수 있습니다)

export interface ProfileData {
  name: string;
  birthYear: string;
  phone: string;
  email: string;
  jobCategory: string; // 희망 근무 형태
  desiredJob: string; // 희망 직종 (일자리 분류와 같은 이름)
  region: string; // 희망 지역: 전체 | 고양 | 파주 | 김포
  location: string;
  experience: string;
  skills: string;
  bio: string;
}

export const EMPTY_PROFILE: ProfileData = {
  name: '',
  birthYear: '',
  phone: '',
  email: '',
  jobCategory: '정규직/전문직',
  desiredJob: '',
  region: '전체',
  location: '',
  experience: '',
  skills: '',
  bio: '',
};

const KEY = 'career_bridge_profile';

export function loadProfile(): ProfileData | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: ProfileData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 저장소를 쓸 수 없는 브라우저(사생활 보호 모드 등)
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// 상담 신청 시 상담사에게 함께 전달되는 요약
export function profileSummary(p: ProfileData | null): string {
  if (!p || !p.experience.trim()) return '';
  return [
    p.birthYear && `출생년도: ${p.birthYear}`,
    p.desiredJob && `희망 직종: ${p.desiredJob}`,
    `희망 근무 형태: ${p.jobCategory}`,
    (p.region !== '전체' || p.location) && `희망 지역: ${[p.region !== '전체' ? p.region : '', p.location].filter(Boolean).join(' ')}`,
    `주요 경력:\n${p.experience.trim()}`,
    p.skills && `보유 기술·자격: ${p.skills}`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ─── 이력서 파일 (IndexedDB, 이 브라우저에만 보관) ───

export interface ResumeFile {
  name: string;
  type: string;
  size: number;
  savedAt: string;
  data: Blob;
}

const DB_NAME = 'career_bridge';
const STORE = 'files';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export async function loadResume(): Promise<ResumeFile | null> {
  try {
    return (await tx<ResumeFile | undefined>('readonly', (s) => s.get('resume'))) || null;
  } catch {
    return null;
  }
}

export async function saveResume(file: File): Promise<ResumeFile> {
  const rec: ResumeFile = { name: file.name, type: file.type, size: file.size, savedAt: new Date().toISOString(), data: file };
  await tx('readwrite', (s) => s.put(rec, 'resume'));
  return rec;
}

export async function deleteResume() {
  await tx('readwrite', (s) => s.delete('resume'));
}
