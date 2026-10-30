import { useEffect, useState } from 'react';
import { Briefcase, GraduationCap, ArrowRight, Award, Compass, Heart, MessageCircle, UserCheck, MapPin, Phone, Clock, Building2, School } from 'lucide-react';
import type { Navigate } from '../App';
import { fetchJobs, fetchPrograms, type Job } from '../api';
import JobTrends, { TREND_REGIONS } from '../components/JobTrends';
import { loadProfile } from '../lib/profile';
import { CENTERS } from '../data/links';

const Home = ({ navigate }: { navigate: Navigate }) => {
  // 고양·파주·김포 공고 전체 (서버가 20분간 저장해 두어 두 번째부터는 빠릅니다)
  const [regionJobs, setRegionJobs] = useState<Record<string, Job[]> | null>(null);
  const [jobsError, setJobsError] = useState(false);
  const [trendRegion] = useState(() => TREND_REGIONS.find((r) => r === loadProfile()?.region) || TREND_REGIONS[0]);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(TREND_REGIONS.map((r) => fetchJobs({ region: r }).then((d) => [r, d.items] as const)))
      .then((entries) => alive && setRegionJobs(Object.fromEntries(entries)))
      .catch(() => alive && setJobsError(true));
    fetchPrograms('course')
      .then((d) => alive && setCourseCount(d.items.length))
      .catch(() => {});
    fetchPrograms('event')
      .then((d) => alive && setEventCount(d.items.length))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const services = [
    { icon: Briefcase, title: '실시간 일자리 정보', desc: '고용24 공공 채용정보와 실시간으로 연결해, 근무지·급여·근무형태·경력 조건을 공고를 열기 전에 한눈에 비교할 수 있습니다.', link: '일자리 찾기', tab: 'jobs' as const },
    { icon: GraduationCap, title: '맞춤형 역량 교육', desc: '지역 교육기관이 직접 등록한 교육과정을 비용·기간·장소·온라인 여부로 비교하고, 수료 후 지원할 수 있는 일자리까지 이어서 확인합니다.', link: '교육 과정 보기', tab: 'education' as const },
    { icon: MessageCircle, title: '1:1 커리어 상담지원', desc: '이력서 클리닉, 면접 준비, 생애경력설계까지 중장년내일센터 상담사와 전화 또는 방문으로 상담받을 수 있습니다.', link: '상담 신청하기', tab: 'counseling' as const },
    { icon: UserCheck, title: '커리어 프로필 관리', desc: '경력, 보유 기술, 희망 직종을 한 번만 정리해 두면 나에게 맞는 일자리와 교육을 함께 추천해 드립니다.', link: '프로필 작성하기', tab: 'profile' as const },
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
            {services.map(({ icon: Icon, title, desc, link, tab }) => (
              <div className="card" key={title}>
                <div className="card-icon-container">
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <button className="card-link" onClick={() => navigate(tab)} style={{ alignSelf: 'flex-start' }}>
                  {link} <ArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 지금 많이 찾는 일자리 (인디드 '최신 트렌드'처럼 한 번에 조건별 목록으로) */}
      <JobTrends data={regionJobs} error={jobsError} initialRegion={trendRegion} navigate={navigate} />

      {/* Centers */}
      <section style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">우리 지역 중장년내일센터</h2>
            <p className="section-desc">가까운 센터에 직접 방문하거나 전화로 상담받으실 수 있어요</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {CENTERS.map((c) => (
              <div key={c.region} className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Building2 size={22} />
                </div>
                <div style={{ flex: '1 1 auto' }}>
                  <span className="badge badge-secondary">{c.region}</span>
                  <h3 style={{ fontSize: '1.05rem', marginTop: '6px', marginBottom: '10px' }}>{c.centerName}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} style={{ flexShrink: 0 }} /> {c.address}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} /> <a href={`tel:${c.phone}`}>{c.phone}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} /> {c.hours}
                    </div>
                  </div>
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
                <span className="badge badge-secondary">{jobsError ? '정보 준비중' : !regionJobs ? '불러오는 중...' : `고양·파주·김포 ${Object.values(regionJobs).reduce((n, l) => n + l.length, 0).toLocaleString()}건`}</span>
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
