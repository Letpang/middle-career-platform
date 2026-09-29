import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Funnel, RefreshCw, ExternalLink, CalendarDays, Briefcase, X } from 'lucide-react';
import type { Navigate } from '../App';
import { fetchJobs, fetchPrograms, type Job, type Program } from '../api';
import { classifyJob, countBy, groupByCategory, jobArea, JOB_FILTERS, matchesQuery, parseFilters, type JobFilterKey } from '../data/jobs';
import { EVENT_SITES, JOB_SITES } from '../data/links';
import { loadProfile } from '../lib/profile';
import JobCard from '../components/JobCard';
import EventCalendar from '../components/EventCalendar';
import { LinkCard, LinkGroups } from '../components/LinkCards';

const REGIONS = ['고양', '파주', '김포'];
const PAGE = 20;

const Jobs = (_: { navigate: Navigate }) => {
  const initial = useMemo(() => new URLSearchParams(window.location.search), []);
  // 주소에 지역이 있으면 그 지역, 없으면 프로필의 희망 지역, 그것도 없으면 고양
  const [region, setRegion] = useState<string>(() => [initial.get('region'), loadProfile()?.region].find((r): r is string => !!r && REGIONS.includes(r)) || REGIONS[0]);
  const [query, setQuery] = useState<string>(initial.get('keyword') || '');
  const [category, setCategory] = useState<string>(initial.get('category') || '전체');
  const [workType, setWorkType] = useState('전체');
  const [filters, setFilters] = useState<JobFilterKey[]>(() => parseFilters(initial.get('filter')));
  const toggleFilter = (key: JobFilterKey, on: boolean) => setFilters((fs) => (on ? [...fs.filter((k) => k !== key), key] : fs.filter((k) => k !== key)));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [shown, setShown] = useState(PAGE); // 화면에 보여줄 개수

  const [events, setEvents] = useState<Program[]>([]);
  const [eventRegion, setEventRegion] = useState('전체');

  // 지역 공고를 모두 불러온 뒤, 검색어와 조건은 화면에서 바로 거릅니다.
  const load = (r: string) => {
    setLoading(true);
    setError(undefined);
    setShown(PAGE);
    fetchJobs({ region: r })
      .then((d) => setJobs(d.items))
      .catch((e) => {
        setError(e.message);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(region);
  }, [region]);

  useEffect(() => {
    fetchPrograms('event')
      .then((d) => setEvents(d.items))
      .catch(() => setEvents([]));
  }, []);


  const categories = useMemo(() => groupByCategory(jobs), [jobs]);
  const workTypes = useMemo(() => ['전체', ...Array.from(new Set(jobs.map((j) => j.type).filter(Boolean)))], [jobs]);

  const filtered = useMemo(() => {
    const tests = JOB_FILTERS.filter((f) => filters.includes(f.key)).map((f) => f.test);
    return jobs.filter(
      (j) =>
        (category === '전체' || classifyJob(j.title) === category) &&
        (workType === '전체' || j.type === workType) &&
        tests.every((t) => t(j)) &&
        matchesQuery(j, query),
    );
  }, [jobs, category, workType, filters, query]);

  // 좁혀 보기: 지금 결과 안에서 동네·조건별로 몇 건씩인지. 결과를 눈에 띄게 줄여 주는 것만 보여 줍니다(90% 이하).
  const narrow = useMemo(() => {
    const useful = (c: { count: number }) => c.count > 0 && c.count <= filtered.length * 0.9;
    const areas = countBy(filtered, jobArea)
      .filter((a) => !query.includes(a.name))
      .slice(0, 5)
      .map((a) => ({ label: a.name, count: filtered.filter((j) => matchesQuery(j, a.name)).length, apply: () => setQuery((q) => `${q.trim()} ${a.name}`.trim()) }))
      .filter(useful);
    const conds = JOB_FILTERS.filter((f) => f.key !== 'closing' && !filters.includes(f.key))
      .map((f) => ({ label: f.label, count: filtered.filter(f.test).length, apply: () => toggleFilter(f.key, true) }))
      .filter(useful);
    return [...areas, ...conds];
  }, [filtered, filters, query]);

  const visible = filtered.slice(0, shown);
  const canLoadMore = filtered.length > shown;
  const activeFilters = [category !== '전체', workType !== '전체'].filter(Boolean).length + filters.length;

  const resetFilters = () => {
    setCategory('전체');
    setWorkType('전체');
    setFilters([]);
  };

  const eventsShown = eventRegion === '전체' ? events : events.filter((e) => !e.region || e.region.includes(eventRegion));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">중장년 맞춤 일자리</h1>
          <p className="page-subtitle">
            고용24와 실시간으로 연결된 고양·파주·김포 채용정보입니다. 회원가입 없이 핵심 조건을 바로 비교하고 직종별로 찾아보세요.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* 검색 · 필터 */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div className="filter-row">
            <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} /> 지역
            </span>
            {REGIONS.map((r) => (
              <button key={r} className={`filter-btn ${region === r ? 'active' : ''}`} onClick={() => setRegion(r)}>
                {r}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              type="text"
              placeholder={`${region} 공고 안에서 직무명, 회사명, 동네 이름으로 찾기 (예: 사무직, 금촌동)`}
              style={{ width: '100%', paddingLeft: '40px', paddingRight: query ? '40px' : undefined }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="채용공고 검색"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="검색어 지우기" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={18} />
              </button>
            )}
          </div>

          <div className="filter-row">
            <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={16} /> 직종
            </span>
            <button className={`filter-btn ${category === '전체' ? 'active' : ''}`} onClick={() => setCategory('전체')}>
              전체
            </button>
            {categories.map((c) => (
              <button key={c.name} className={`filter-btn ${category === c.name ? 'active' : ''}`} onClick={() => setCategory(c.name)}>
                {c.name} <span style={{ opacity: 0.75 }}>{c.count}</span>
              </button>
            ))}
          </div>

          <div className="filter-row">
            <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Funnel size={16} /> 조건
            </span>
            <select value={workType} onChange={(e) => setWorkType(e.target.value)} aria-label="근무형태" style={{ padding: '8px 12px' }}>
              {workTypes.map((t) => (
                <option key={t} value={t}>
                  {t === '전체' ? '근무형태 전체' : t}
                </option>
              ))}
            </select>
            {JOB_FILTERS.map((f) => (
              <label key={f.key} className="check-toggle">
                <input type="checkbox" checked={filters.includes(f.key)} onChange={(e) => toggleFilter(f.key, e.target.checked)} /> {f.label}
              </label>
            ))}
            {activeFilters > 0 && (
              <button className="link-btn" onClick={resetFilters}>
                조건 초기화
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {`'${region}' 지역 공고 ${jobs.length.toLocaleString()}건을 모두 불러왔어요. 검색어와 조건은 바로 적용됩니다.`}{' '}
            직종은 공고 제목으로 자동 분류되어 일부 다를 수 있어요.
          </p>
        </div>

        {/* 결과 */}
        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>채용정보를 불러오는 중입니다...</div>}

        {!loading && error && (
          <div className="panel" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <p style={{ color: 'var(--danger-text)', fontSize: '1.05rem', marginBottom: '8px' }}>채용정보를 불러오지 못했습니다.</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {error}
              <br />
              고용24 서버가 잠시 바쁠 때 생기는 문제로, 잠시 후 다시 시도하면 대부분 해결됩니다.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => load(region)}>
                <RefreshCw size={16} /> 다시 시도
              </button>
              <a className="btn btn-secondary" href="https://www.work24.go.kr/" target="_blank" rel="noopener noreferrer">
                고용24에서 직접 찾기 <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <p style={{ fontWeight: 600, marginBottom: '14px' }}>
              조건에 맞는 공고 <span style={{ color: 'var(--primary)' }}>{filtered.length.toLocaleString()}건</span>
            </p>
            {narrow.length > 0 && (
              <div className="filter-row" style={{ marginBottom: '18px' }}>
                <span className="filter-label">좁혀 보기</span>
                {narrow.map((c) => (
                  <button key={c.label} className="filter-btn" onClick={c.apply}>
                    {c.label} <span style={{ opacity: 0.75 }}>{c.count}</span>
                  </button>
                ))}
              </div>
            )}
            {visible.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {visible.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '14px' }}>조건에 맞는 공고가 없습니다.</p>
                {activeFilters > 0 && (
                  <button className="btn btn-secondary" onClick={resetFilters}>
                    조건 초기화
                  </button>
                )}
              </div>
            )}
            {canLoadMore && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShown((s) => s + PAGE)}>
                  공고 더 보기
                </button>
              </div>
            )}
          </>
        )}

        {/* 채용행사 */}
        <section style={{ marginTop: '70px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={22} style={{ color: 'var(--primary)' }} /> 관내 채용행사·채용박람회 달력
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            센터와 기관이 직접 등록한 채용박람회, 구인구직 만남의 날, 동행면접 일정입니다. 날짜를 누르면 그날 행사를 볼 수 있어요.
          </p>
          <div className="filter-row" style={{ marginBottom: '16px' }}>
            {REGIONS.map((r) => (
              <button key={r} className={`filter-btn ${eventRegion === r ? 'active' : ''}`} onClick={() => setEventRegion(r)}>
                {r}
              </button>
            ))}
          </div>
          <div className="panel">
            <EventCalendar events={eventsShown} />
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '28px 0 12px', color: 'var(--primary)' }}>고용센터 채용행사 달력 바로가기</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {EVENT_SITES.map((s) => (
              <LinkCard key={s.name} site={s} />
            ))}
          </div>
        </section>

        {/* 다른 채용사이트 */}
        <section style={{ marginTop: '70px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>다른 채용사이트도 함께 확인해보세요</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            분야별로 자주 활용되는 전문 채용사이트예요. <strong>회원가입 필요</strong> 표시가 있는 곳은 가입해야 공고를 볼 수 있어요.
          </p>
          <LinkGroups groups={JOB_SITES} />
        </section>
      </div>
    </div>
  );
};

export default Jobs;
