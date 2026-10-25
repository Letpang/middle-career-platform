-- 날짜별 방문 기록 (날짜는 한국 시간 기준 YYYY-MM-DD)
-- visits: 사이트를 연 횟수, visitors: 그날 처음 들어온 기기 수
CREATE TABLE daily_visits (
  day TEXT PRIMARY KEY,
  visits INTEGER NOT NULL DEFAULT 0,
  visitors INTEGER NOT NULL DEFAULT 0
);
