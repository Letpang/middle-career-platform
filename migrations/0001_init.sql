-- 교육기관 계정 (관리자 승인 후 활동 가능)
CREATE TABLE orgs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login_id TEXT NOT NULL UNIQUE,
  pw_hash TEXT NOT NULL,
  pw_salt TEXT NOT NULL,
  name TEXT NOT NULL,
  org_type TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  manager TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  homepage TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT
);

-- 로그인 세션 (기관 / 관리자)
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  kind TEXT NOT NULL, -- org | admin
  org_id INTEGER,
  expires_at TEXT NOT NULL
);

-- 기관이 등록한 교육과정 · 채용행사
CREATE TABLE programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES orgs(id),
  kind TEXT NOT NULL DEFAULT 'course', -- course | event
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '',
  apply_start TEXT NOT NULL DEFAULT '',
  apply_end TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT '',
  place TEXT NOT NULL DEFAULT '',
  delivery TEXT NOT NULL DEFAULT '대면', -- 대면 | 온라인 | 혼합
  cost_type TEXT NOT NULL DEFAULT '무료', -- 무료 | 국비지원 | 유료
  cost_detail TEXT NOT NULL DEFAULT '',
  capacity TEXT NOT NULL DEFAULT '',
  related_jobs TEXT NOT NULL DEFAULT '', -- 수료 후 연계 직종 (쉼표 구분)
  contact TEXT NOT NULL DEFAULT '',
  apply_url TEXT NOT NULL DEFAULT '',
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_programs_org ON programs(org_id);
CREATE INDEX idx_programs_kind ON programs(kind, visible);

-- 1:1 상담 신청 (센터 관리자 화면에서 확인)
CREATE TABLE counseling_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  center TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  preferred_time TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  profile_summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new', -- new | contacted | done
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 누적 방문자 수 (기존 사이트 집계값 74에서 이어서 셉니다)
CREATE TABLE counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
INSERT INTO counters (name, value) VALUES ('visits', 74);
