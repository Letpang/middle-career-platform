import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Navigate } from '../App';
import type { Job } from '../api';
import { classifyJob, countBy, jobArea, JOB_FILTERS, matchesQuery, OTHER_CATEGORY, SENIOR_KEYWORDS } from '../data/jobs';

export const TREND_REGIONS = ['고양', '파주', '김포'] as const;

type Item = { label: string; count: number; query: Record<string, string> };

// 메인 "지금 많이 찾는 일자리": 지역 공고를 직종·동네·조건·검색어로 묶어, 누르면 그 조건의 일자리 목록으로 바로 갑니다.
const JobTrends = ({
  data,
  error,
  initialRegion,
  navigate,
}: {
  data: Record<string, Job[]> | null;
  error?: boolean;
  initialRegion: string;
  navigate: Navigate;
}) => {
  const [region, setRegion] = useState(initialRegion);
  const jobs = data?.[region] || [];

  const columns = useMemo(() => {
    const base = { region };
    const cats: Item[] = countBy(jobs, (j) => classifyJob(j.title))
      .filter((c) => c.name !== OTHER_CATEGORY)
      .slice(0, 7)
      .map((c) => ({ label: c.name, count: c.count, query: { ...base, category: c.name } }));
    // 동네 이름을 뽑은 뒤, 일자리 탭과 같은 검색어 규칙으로 다시 세어 숫자를 맞춥니다.
    const areas: Item[] = countBy(jobs, jobArea)
      .slice(0, 7)
      .map((a) => ({ label: `${a.name} 일자리`, count: jobs.filter((j) => matchesQuery(j, a.name)).length, query: { ...base, keyword: a.name } }))
      .sort((x, y) => y.count - x.count);
    const conds: Item[] = JOB_FILTERS.filter((f) => f.key !== 'closing')
      .map((f) => ({ label: f.label, count: jobs.filter(f.test).length, query: { ...base, filter: f.key } }))
      .filter((c) => c.count > 0);
    const words: Item[] = SENIOR_KEYWORDS.map((w) => ({ label: w, count: jobs.filter((j) => matchesQuery(j, w)).length, query: { ...base, keyword: w } }))
      .filter((w) => w.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
    return [
      { title: '많이 올라온 직종', items: cats },
      { title: '우리 동네', items: areas },
      { title: '조건으로 찾기', items: conds },
      { title: '중장년이 많이 찾는 검색어', items: words },
    ].filter((c) => c.items.length > 0);
  }, [jobs, region]);

  return (
    <section style={{ padding: '20px 0 60px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 className="section-title">지금 많이 찾는 일자리</h2>
          <p className="section-desc" style={{ marginBottom: '20px' }}>
            고용24에 올라온 우리 지역 공고를 한눈에 나눠 봤어요. 누르면 해당 공고만 바로 보여 드려요.
          </p>
          <div className="filter-row" style={{ justifyContent: 'center' }}>
            {TREND_REGIONS.map((r) => (
              <button key={r} className={`filter-btn ${region === r ? 'active' : ''}`} onClick={() => setRegion(r)}>
                {r} {data?.[r] && <span style={{ opacity: 0.75 }}>{data[r].length.toLocaleString()}</span>}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>채용정보를 잠시 불러오지 못했어요. 일자리 메뉴에서 다시 확인해 주세요.</p>
        ) : !data ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>우리 지역 공고를 나누는 중입니다...</p>
        ) : (
          <div className="trend-grid">
            {columns.map((col) => (
              <div key={col.title} className="trend-col">
                <h3 className="trend-title">{col.title}</h3>
                <ul>
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <button className="trend-link" onClick={() => navigate('jobs', it.query)}>
                        <span>
                          {region} {it.label}
                        </span>
                        <span className="trend-count">{it.count.toLocaleString()}건</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('jobs', { region })}>
            {region} 일자리 모두 보기 <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobTrends;
