import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Building2, CalendarDays, Clock, ExternalLink, GraduationCap, Briefcase, Megaphone, MapPin, MessageCircle, Phone, Sparkles } from 'lucide-react';
import type { Navigate } from '../App';
import { fetchCenter, fetchJobs, type CenterPost, type Job } from '../api';
import { findRegion } from '../data/regions';
import { CENTER_SERVICES, centerBySlug, centerRegion } from '../data/centers';
import { CENTERS } from '../data/links';
import ProgramCard from '../components/ProgramCard';
import JobCard from '../components/JobCard';

type CenterData = Awaited<ReturnType<typeof fetchCenter>>;

const SECTIONS = [
  { id: 'services', label: '서비스 안내' },
  { id: 'courses', label: '교육 일정' },
  { id: 'jobs', label: '채용정보' },
  { id: 'events', label: '채용행사' },
  { id: 'notices', label: '공지사항' },
  { id: 'location', label: '오시는 길' },
];

const JOB_PREVIEW = 4;

// 센터가 홈페이지를 아직 만들지 않았으면 전국 명단의 주소·전화로 기본 페이지를 보여 줍니다 (/center/<운영기관>).
function basicCenter(slug: string): CenterData | null {
  const c = centerBySlug(slug);
  if (!c) return null;
  return {
    center: {
      slug,
      org_id: 0,
      name: c.name,
      operator: c.operator,
      intro: '',
      address: c.address,
      phone: c.phone,
      hours: CENTERS.find((x) => x.centerName === c.name)?.hours || '',
      map_url: '',
      job_region: centerRegion(c),
      services: CENTER_SERVICES,
      published: 1,
      homepage: '',
      updated_at: '',
    },
    programs: [],
    posts: [],
  };
}

const dateOnly = (s: string) => (s || '').slice(0, 10).replace(/-/g, '.');

// 주소의 /center/<slug> 에서 slug
function centerSlugFromPath(pathname = window.location.pathname): string {
  const m = /^\/center\/([^/]+)/.exec(pathname);
  if (!m) return '';
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return '';
  }
}

const SectionTitle = ({ id, icon: Icon, title, desc }: { id: string; icon: typeof Phone; title: string; desc?: string }) => (
  <div id={id} style={{ scrollMarginTop: '90px', marginBottom: '18px' }}>
    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={22} style={{ color: 'var(--primary)' }} /> {title}
    </h2>
    {desc && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{desc}</p>}
  </div>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <div className="panel" style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text-muted)' }}>
    {children}
  </div>
);

const PostJobCard = ({ post }: { post: CenterPost }) => (
  <article className="card" style={{ gap: '8px', height: 'auto' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      <span className="chip chip-good">센터 추천</span>
      {post.deadline && <span className="chip chip-warn">~ {dateOnly(post.deadline)} 마감</span>}
    </div>
    <h3 style={{ fontSize: '1.1rem', marginBottom: 0 }}>{post.title}</h3>
    {post.company && (
      <p style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Building2 size={15} /> {post.company}
      </p>
    )}
    {post.body && <p style={{ fontSize: '0.9rem', marginBottom: 0, whiteSpace: 'pre-wrap' }}>{post.body}</p>}
    {post.link && (
      <a href={post.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
        자세히 보기 <ExternalLink size={14} />
      </a>
    )}
  </article>
);

const CenterPage = ({ navigate }: { navigate: Navigate }) => {
  const slug = useMemo(() => centerSlugFromPath(), []);
  const [data, setData] = useState<CenterData | null>(null);
  const [error, setError] = useState<string>();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [jobsError, setJobsError] = useState(false);

  useEffect(() => {
    const show = (d: CenterData) => {
      setData(d);
      document.title = `${d.center.name} | 커리어 브릿지`;
    };
    fetchCenter(slug)
      .then(show)
      .catch((e) => {
        const basic = basicCenter(slug);
        if (basic) show(basic);
        else setError(e instanceof Error ? e.message : '센터 정보를 불러오지 못했습니다.');
      });
  }, [slug]);

  const jobRegion = data?.center.job_region || '';
  const region = findRegion(jobRegion);

  useEffect(() => {
    if (!jobRegion) return;
    fetchJobs({ region: jobRegion })
      .then((d) => setJobs(d.items))
      .catch(() => setJobsError(true));
  }, [jobRegion]);

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('home')}>
          처음 화면으로
        </button>
      </div>
    );
  }
  if (!data) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>센터 정보를 불러오는 중입니다...</div>;

  const { center, programs, posts } = data;
  const courses = programs.filter((p) => p.kind === 'course');
  const events = programs.filter((p) => p.kind === 'event');
  const notices = posts.filter((p) => p.kind === 'notice');
  const jobPosts = posts.filter((p) => p.kind === 'job');
  const mapUrl = center.map_url || (center.address ? `https://map.naver.com/p/search/${encodeURIComponent(center.address)}` : '');
  const goJobs = (query: Record<string, string> = {}) => navigate('jobs', region ? { region: region.key, ...query } : query);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          {center.operator && <span className="badge badge-secondary">운영 {center.operator}</span>}
          <h1 className="page-title" style={{ marginTop: '8px' }}>
            {center.name}
          </h1>
          <p className="page-subtitle" style={{ whiteSpace: 'pre-wrap' }}>
            {center.intro || '40세 이상 재직자·퇴직(예정)자의 생애경력설계, 전직지원, 재취업을 무료로 도와드립니다.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
            {center.phone && (
              <a className="btn btn-primary" href={`tel:${center.phone}`}>
                <Phone size={16} /> {center.phone}
              </a>
            )}
            <button className="btn btn-secondary" onClick={() => navigate('counseling', { center: center.org_id ? `org:${center.org_id}` : center.name })}>
              <MessageCircle size={16} /> 1:1 상담 신청
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        <nav className="filter-row" style={{ marginBottom: '36px' }} aria-label="센터 홈페이지 목차">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="filter-btn">
              {s.label}
            </a>
          ))}
        </nav>

        {center.services.length > 0 && (
          <section style={{ marginBottom: '56px' }}>
            <SectionTitle id="services" icon={Sparkles} title="서비스 안내" desc="모든 서비스는 무료입니다." />
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {center.services.map((s) => (
                <div key={s.title} className="card" style={{ gap: '8px', height: 'auto' }}>
                  {s.target && <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{s.target}</span>}
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 0 }}>{s.title}</h3>
                  {s.desc && <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>{s.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: '56px' }}>
          <SectionTitle id="courses" icon={GraduationCap} title="교육 일정" desc="센터에서 운영하는 교육입니다. 신청 방법은 각 교육 안내를 확인하세요." />
          {courses.length > 0 ? (
            <div className="grid">
              {courses.map((p) => (
                <ProgramCard key={p.id} p={p} onRelatedJob={(job) => goJobs({ keyword: job })} />
              ))}
            </div>
          ) : (
            <Empty>지금 모집 중인 교육이 없습니다. 센터로 문의해 주세요.</Empty>
          )}
        </section>

        <section style={{ marginBottom: '56px' }}>
          <SectionTitle id="jobs" icon={Briefcase} title="채용정보" desc={region ? `센터 추천 공고와 고용24의 ${region.name} 공고입니다.` : '센터 추천 공고입니다.'} />
          {jobPosts.length > 0 && (
            <div className="grid" style={{ marginBottom: '24px' }}>
              {jobPosts.map((p) => (
                <PostJobCard key={p.id} post={p} />
              ))}
            </div>
          )}
          {region && (
            <>
              {jobs === null && !jobsError && <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>고용24 공고를 불러오는 중입니다...</p>}
              {jobsError && <Empty>고용24 공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Empty>}
              {jobs && jobs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {jobs.slice(0, JOB_PREVIEW).map((j) => (
                    <JobCard key={j.id} job={j} />
                  ))}
                </div>
              )}
              {jobs && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button className="btn btn-secondary" onClick={() => goJobs()}>
                    {region.name} 공고 {jobs.length.toLocaleString()}건 모두 보기
                  </button>
                </div>
              )}
            </>
          )}
          {!region && jobPosts.length === 0 && <Empty>등록된 추천 공고가 없습니다.</Empty>}
        </section>

        <section style={{ marginBottom: '56px' }}>
          <SectionTitle id="events" icon={CalendarDays} title="채용행사" desc="채용박람회, 구인·구직 만남의 날, 동행면접 일정입니다." />
          {events.length > 0 ? (
            <div className="grid">
              {events.map((p) => (
                <ProgramCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <Empty>예정된 채용행사가 없습니다.</Empty>
          )}
        </section>

        <section style={{ marginBottom: '56px' }}>
          <SectionTitle id="notices" icon={Megaphone} title="공지사항" />
          {notices.length > 0 ? (
            <div className="panel" style={{ padding: 0 }}>
              {notices.map((n, i) => (
                <details key={n.id} style={{ padding: '16px 20px', borderTop: i ? '1px solid var(--border-color)' : undefined }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span>{n.title}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, flexShrink: 0 }}>{dateOnly(n.created_at)}</span>
                  </summary>
                  {n.body && <p style={{ marginTop: '12px', fontSize: '0.92rem', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{n.body}</p>}
                  {n.link && (
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="card-link" style={{ marginTop: '8px' }}>
                      관련 링크 <ExternalLink size={14} />
                    </a>
                  )}
                </details>
              ))}
            </div>
          ) : (
            <Empty>등록된 공지가 없습니다.</Empty>
          )}
        </section>

        <section>
          <SectionTitle id="location" icon={MapPin} title="오시는 길·연락처" />
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {center.address && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--primary)' }} /> {center.address}
              </div>
            )}
            {center.phone && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} style={{ flexShrink: 0, color: 'var(--primary)' }} /> <a href={`tel:${center.phone}`}>{center.phone}</a>
              </div>
            )}
            {center.hours && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Clock size={18} style={{ flexShrink: 0, color: 'var(--primary)' }} /> {center.hours}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
              {mapUrl && (
                <a className="btn btn-secondary btn-sm" href={mapUrl} target="_blank" rel="noopener noreferrer">
                  지도에서 보기 <ExternalLink size={14} />
                </a>
              )}
              {center.homepage && (
                <a className="btn btn-secondary btn-sm" href={center.homepage} target="_blank" rel="noopener noreferrer">
                  기관 홈페이지 <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CenterPage;
