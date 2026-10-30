import { useEffect, useState } from 'react';
import { Briefcase, GraduationCap, ArrowRight, Award, Compass, Heart, MessageCircle, MapPin, Phone, Clock, Building2, School } from 'lucide-react';
import type { Navigate } from '../App';
import { fetchCenters, fetchJobs, fetchPrograms, type CenterSummary, type Job } from '../api';
import JobTrends from '../components/JobTrends';
import { CENTERS } from '../data/links';
import { centerRegion, centerSlug, matchCenter, NATIONAL_CENTERS } from '../data/centers';
import type { Region } from '../data/regions';

// 상단에서 고른 지역(region)의 공고와 중장년내일센터를 보여 줍니다. 지역이 바뀌면 화면을 새로 그립니다(App 의 key).
const Home = ({ navigate, region }: { navigate: Navigate; region: Region }) => {
  // 우리 지역 공고 전체 (서버가 20분간 저장해 두어 두 번째부터는 빠릅니다)
  const [regionJobs, setRegionJobs] = useState<Job[] | null>(null);
  const [jobsError, setJobsError] = useState(false);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [centerPages, setCenterPages] = useState<CenterSummary[]>([]);

  useEffect(() => {
    let alive = true;
    fetchJobs({ region: region.key })
      .then((d) => alive && setRegionJobs(d.items))
      .catch(() => alive && setJobsError(true));
    fetchPrograms('course')
      .then((d) => alive && setCourseCount(d.items.length))
      .catch(() => {});
    fetchPrograms('event')
      .then((d) => alive && setEventCount(d.items.length))
      .catch(() => {});
    fetchCenters()
      .then((d) => alive && setCenterPages(d.items))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [region.key]);

  // 같은 시·군·구의 센터, 없으면 같은 시·도의 센터. 센터가 홈페이지를 만들었으면 그 링크와 운영시간을 붙입니다.
  const sameArea = NATIONAL_CENTERS.filter((c) => centerRegion(c) === region.key);
  const centers = (sameArea.length ? sameArea : NATIONAL_CENTERS.filter((c) => c.sido === region.sido.name)).map((c) => {
    const page = centerPages.find((p) => matchCenter(p.name) === c);
    return {
      region: centerRegion(c).split(' ')[1] || c.sido,
      centerName: c.name,
      address: page?.address || c.address,
      phone: page?.phone || c.phone,
      hours: page?.hours || CENTERS.find((x) => x.centerName === c.name)?.hours || '',
      slug: page?.slug || centerSlug(c),
    };
  });
  // 우리 지역 첫 센터의 홈페이지. 시·도에 센터가 없으면 아래 센터 목록으로 내려갑니다.
  const centerHome = centers[0];
  const goCenterHome = () => (centerHome ? navigate('center', { slug: centerHome.slug }) : document.getElementById('centers')?.scrollIntoView({ behavior: 'smooth' }));

  const services = [
    { icon: Briefcase, title: '실시간 일자리 정보', desc: '고용24 공공 채용정보와 실시간으로 연결해, 근무지·급여·근무형태·경력 조건을 공고를 열기 전에 한눈에 비교할 수 있습니다.', link: '일자리 찾기', tab: 'jobs' as const },
    { icon: GraduationCap, title: '맞춤형 역량 교육', desc: '지역 교육기관이 직접 등록한 교육과정을 비용·기간·장소·온라인 여부로 비교하고, 수료 후 지원할 수 있는 일자리까지 이어서 확인합니다.', link: '교육 과정 보기', tab: 'education' as const },
    {
      icon: Building2,
      title: '중장년내일센터 홈페이지',
      desc: `${region.name} 가까운 중장년내일센터의 교육 일정, 추천 채용, 공지사항, 오시는 길을 센터 홈페이지에서 한 번에 확인할 수 있습니다.`,
      link: centerHome ? '센터 홈페이지 가기' : '우리 지역 센터 보기',
      onClick: goCenterHome,
    },
    {
      icon: MessageCircle,
      title: '1:1 상담·커리어 프로필',
      desc: '경력, 보유 기술, 희망 직종을 프로필에 정리해 두면 맞는 일자리와 교육을 추천해 드리고, 상담 신청 때 상담사에게 함께 전달되어 이력서 클리닉·면접 준비·생애경력설계를 도와드립니다.',
      link: '상담 신청하기',
      tab: 'counseling' as const,
      extra: { link: '프로필 작성하기', tab: 'profile' as const },
    },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="hero-tag">4060 세대의 새로운 도약</span>
          <h1>
            인생 2막의 든든한 디딤돌
            <br />
            <span>중장년 커리어 브릿지</span>
          </h1>
          <p className="hero-subtitle">오랜 시간 쌓아오신 소중한 경험과 지혜가 새로운 기회로 이어지도록, 실시간 채용정보부터 맞춤 교육, 1:1 상담까지 한 곳에서 도와드립니다.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('jobs')}>
              맞춤 일자리 찾기
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary" onClick={goCenterHome}>
              <Building2 size={18} />
              중장년내일센터 바로가기
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('counseling')}>
              1:1 상담 신청하기
            </button>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">핵심 제공 서비스</h2>
            <p className="section-desc">성공적인 재취업 준비를 위한 4가지 서비스</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {services.map(({ icon: Icon, title, desc, link, tab, onClick, extra }) => (
              <div className="card" key={title}>
                <div className="card-icon-container">
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button className="card-link" onClick={() => (onClick ? onClick() : tab && navigate(tab))} style={{ alignSelf: 'flex-start' }}>
                    {link} <ArrowRight />
                  </button>
                  {extra && (
                    <button className="card-link" onClick={() => navigate(extra.tab)} style={{ alignSelf: 'flex-start' }}>
                      {extra.link} <ArrowRight />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 지금 많이 찾는 일자리 (인디드 '최신 트렌드'처럼 한 번에 조건별 목록으로) */}
      <JobTrends data={regionJobs} error={jobsError} region={region} navigate={navigate} />

      {/* Centers */}
      <section id="centers" style={{ padding: '20px 0 60px', scrollMarginTop: '80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">우리 지역 중장년내일센터</h2>
            <p className="section-desc">
              {sameArea.length ? `${region.key}에 있는 센터예요.` : centers.length ? `${region.name}에는 센터가 없어 ${region.sido.name}의 센터를 보여 드려요.` : ''} 직접 방문하거나 전화로 상담받으실 수 있어요
            </p>
          </div>
          {centers.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              {region.sido.name}에는 아직 중장년내일센터가 없어요. 상담 신청에서 전국 어느 센터든 고를 수 있어요.
            </p>
          )}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {centers.map((c) => (
              <div key={c.centerName} className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Building2 size={22} />
                </div>
                <div style={{ flex: '1 1 auto' }}>
                  {c.region && <span className="badge badge-secondary">{c.region}</span>}
                  <h3 style={{ fontSize: '1.05rem', marginTop: '6px', marginBottom: '10px' }}>{c.centerName}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} style={{ flexShrink: 0 }} /> {c.address}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} /> <a href={`tel:${c.phone}`}>{c.phone}</a>
                    </div>
                    {c.hours && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} /> {c.hours}
                      </div>
                    )}
                  </div>
                  <button className="card-link" style={{ marginTop: '12px' }} onClick={() => navigate('center', { slug: c.slug })}>
                    센터 홈페이지 <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>우리의 가치</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '10px', marginBottom: '20px', lineHeight: 1.3 }}>
                경험은 가장 큰 자산이자
                <br />
                사회의 가장 밝은 빛입니다.
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                중장년 세대의 지혜는 새로운 세대와 사회에 귀중한 나침반이 됩니다. 커리어 브릿지는 이 연결고리가 끊어지지 않도록 단단한 다리가 되어 드리겠습니다.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: Award, color: 'var(--success)', t: '전문 경력의 가치 재발견', d: '은퇴 이후에도 전문성을 살려 컨설턴트 및 멘토로 활약하도록 돕습니다.' },
                  { icon: Compass, color: 'var(--secondary)', t: '새로운 도전 지원', d: '디지털 도구 및 최신 기술 교육을 통해 누구나 쉽게 적응할 수 있도록 지원합니다.' },
                  { icon: Heart, color: 'var(--danger)', t: '사람 중심의 상담', d: '혼자 고민하지 않도록, 전문 상담사가 눈높이에 맞춰 함께 길을 찾아 드립니다.' },
                ].map(({ icon: Icon, color, t, d }) => (
                  <div key={t} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ color, marginTop: '4px' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{t}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--bg-primary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>간편 연결 정보</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>지금 바로 시작해 보세요</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>기관 등록 교육과정</span>
                <span className="badge badge-primary">{courseCount === null ? '확인 중' : `${courseCount}개 과정`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>예정된 채용행사</span>
                <span className="badge badge-primary">{eventCount === null ? '확인 중' : `${eventCount}건`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>채용 중 일자리 (고용24 실시간)</span>
                <span className="badge badge-secondary">{jobsError ? '정보 준비중' : !regionJobs ? '불러오는 중...' : `${region.name} ${regionJobs.length.toLocaleString()}건`}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={() => navigate('counseling')}>
                지금 상담 신청하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For institutions */}
      <section style={{ padding: '50px 0' }}>
        <div className="container">
          <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: '1 1 400px' }}>
              <div className="card-icon-container" style={{ marginBottom: 0, flexShrink: 0 }}>
                <School size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>교육기관·센터 담당자이신가요?</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  기관 계정을 신청하시면 승인 후 교육과정과 채용행사를 직접 등록하고 수정할 수 있습니다. 등록한 내용은 교육 페이지와 채용행사 달력에 바로 나타납니다.
                </p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('org')}>
              기관 등록·로그인 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
