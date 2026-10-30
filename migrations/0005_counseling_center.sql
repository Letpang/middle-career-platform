-- 상담 신청이 어느 센터 계정으로 갔는지 (전국 센터). 예전 신청과 계정 없는 센터는 NULL
ALTER TABLE counseling_requests ADD COLUMN org_id INTEGER REFERENCES orgs(id);
