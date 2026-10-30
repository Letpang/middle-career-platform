-- 중장년내일센터 홈페이지 (/center/<slug>)
-- 기관 유형이 '중장년내일센터'인 승인된 기관 계정이 직접 채웁니다.
CREATE TABLE center_pages (
  org_id INTEGER PRIMARY KEY REFERENCES orgs(id),
  slug TEXT NOT NULL UNIQUE,          -- 주소 끝부분 (예: 고양)
  operator TEXT NOT NULL DEFAULT '',  -- 운영기관 (예: 고양상공회의소)
  intro TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  map_url TEXT NOT NULL DEFAULT '',
  job_region TEXT NOT NULL DEFAULT '', -- 고용24 공고를 보여 줄 지역 (예: 경기 고양시)
  services TEXT NOT NULL DEFAULT '[]', -- JSON [{title, target, desc}]
  published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 센터 공지사항(notice)과 센터가 직접 올리는 추천 채용(job)
CREATE TABLE center_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES orgs(id),
  kind TEXT NOT NULL DEFAULT 'notice', -- notice | job
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  deadline TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_center_posts_org ON center_posts(org_id, kind);
