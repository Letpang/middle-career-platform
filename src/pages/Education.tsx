import { useEffect, useMemo, useState } from 'react';
import { Search, Compass, ArrowRight, School } from 'lucide-react';
import type { Navigate } from '../App';
import { fetchPrograms, type Program } from '../api';
import { EDUCATION_SITES, CENTERS } from '../data/links';
import ProgramCard, { programStatus } from '../components/ProgramCard';
import { LinkGroups } from '../components/LinkCards';

const REGIONS = ['전체', '고양', '파주', '김포', '온라인'];
const COSTS = ['전체', '무료', '국비지원', '유료'];
const DELIVERIES = ['전체', '대면', '온라인', '혼합'];

const Education = ({ navigate }: { navigate: Navigate }) => {
  const [courses, setCourses] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [region, setRegion] = useState('전체');
  const [cost, setCost] = useState('전체');
  const [delivery, setDelivery] = useState('전체');
  const [category, setCategory] = useState('전체');
  const [openOnly, setOpenOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [siteRegion, setSiteRegion] = useState('전체');

  useEffect(() => {
    fetchPrograms('course')
      .then((d) => setCourses(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['전체', ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))], [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (region !== '전체' && !(c.region.includes(region) || (region === '온라인' && c.delivery === '온라인'))) return false;
      if (cost !== '전체' && c.cost_type !== cost) return false;
      if (delivery !== '전체' && c.delivery !== delivery) return false;
      if (category !== '전체' && c.category !== category) return false;
      if (openOnly && !['모집 중', '접수 예정'].includes(programStatus(c).label)) return false;
      if (q && !`${c.title} ${c.summary} ${c.org_name} ${c.related_jobs} ${c.place}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [courses, region, cost, delivery, category, openOnly, query]);

  const sites = siteRegion === '전체' ? EDUCATION_SITES : EDUCATION_SITES.filter((g) => g.category.startsWith(siteRegion));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">재취업 & 역량 교육</h1>
          <p className="page-subtitle">고양·파주·김포 지역 교육기관이 직접 등록한 교육과정을 비용·기간·장소로 비교하고, 수료 후 지원할 수 있는 일자리까지 이어서 확인하세요.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* 생애설계 · 재도약 */}
        <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '40px', background: 'linear-gradient(135deg, var(--primary-light), var(--bg-secondary))' }}>
          <div style={{ display: 'flex', gap: '16px', flex: '1 1 420px', alignItems: 'flex-start' }}>
            <div className="card-icon-container" style={{ marginBottom: 0, flexShrink: 0, backgroundColor: 'var(--bg-secondary)' }}>
              <Compass size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>인생 2막 설계부터 시작해 보세요 — 중장년 <span className="nowrap">생애경력설계·재도약</span> 지원</h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                중장년내일센터에서는 지난 경력을 돌아보고 앞으로의 일과 삶을 함께 설계하는 생애경력설계 프로그램과 재도약 교육을 무료로 운영합니다.
                {CENTERS.map((c, i) => (
                  <span key={c.region}>
                    {i > 0 ? ' · ' : ' '}
                    {c.region} <a className="nowrap" href={`tel:${c.phone}`}>{c.phone}</a>
                  </span>
                ))}
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('counseling', { topic: '생애경력설계·재도약' })}>
            생애설계 상담 신청 <ArrowRight size={18} />
          </button>
        </div>

        {/* 지역 교육기관 */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>지역 평생교육·직업훈련 기관 바로가기</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>시청 평생학습 포털과 관내 대학 평생교육원, 직업훈련기관으로 바로 연결됩니다.</p>
        <div className="filter-row" style={{ marginBottom: '20px' }}>
          {['전체', '고양', '파주', '김포', '서울'].map((r) => (
            <button key={r} className={`filter-btn ${siteRegion === r ? 'active' : ''}`} onClick={() => setSiteRegion(r)}>
              {r === '서울' ? '서울 강서' : r}
            </button>
          ))}
        </div>
        <LinkGroups groups={sites} />

        {/* 기관 등록 교육과정 */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '56px', marginBottom: '14px' }}>기관이 등록한 교육과정</h2>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input type="text" placeholder="교육명, 기관명, 관련 직종으로 찾기 (예: 요양보호사, 엑셀)" style={{ width: '100%', paddingLeft: '40px' }} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="교육과정 검색" />
          </div>
          <div className="filter-row">
            <span className="filter-label">지역</span>
            {REGIONS.map((r) => (
              <button key={r} className={`filter-btn ${region === r ? 'active' : ''}`} onClick={() => setRegion(r)}>
                {r}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <span className="filter-label">교육비</span>
            {COSTS.map((c) => (
              <button key={c} className={`filter-btn ${cost === c ? 'active' : ''}`} onClick={() => setCost(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <span className="filter-label">방식</span>
            {DELIVERIES.map((d) => (
              <button key={d} className={`filter-btn ${delivery === d ? 'active' : ''}`} onClick={() => setDelivery(d)}>
                {d}
              </button>
            ))}
            <label className="check-toggle" style={{ marginLeft: '8px' }}>
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> 지금 신청 가능한 과정만
            </label>
          </div>
          {categories.length > 1 && (
            <div className="filter-row">
              <span className="filter-label">분야</span>
              {categories.map((c) => (
                <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>교육과정을 불러오는 중입니다...</p>}
        {!loading && error && <div className="notice notice-error">{error}</div>}
        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              <div className="grid">
                {filtered.map((c) => (
                  <ProgramCard key={c.id} p={c} onRelatedJob={(job) => navigate('jobs', { keyword: job })} />
                ))}
              </div>
            ) : (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '60px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {courses.length === 0 ? '아직 등록된 교육과정이 없습니다.' : '조건에 맞는 교육과정이 없습니다. 조건을 바꿔 보세요.'}
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>위 지역 교육기관 사이트에서도 과정을 확인하실 수 있어요.</p>
              </div>
            )}
          </>
        )}

        <div className="notice" style={{ marginTop: '40px' }}>
          <School size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            교육기관 담당자이신가요? 기관 계정을 신청하시면 승인 후 교육과정을 직접 등록·수정할 수 있습니다.{' '}
            <button className="link-btn" onClick={() => navigate('org')}>
              기관 등록·로그인 →
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Education;
