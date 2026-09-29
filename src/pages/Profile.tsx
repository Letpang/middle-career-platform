import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { User, Phone, Mail, Award, MapPin, Briefcase, FileText, Save, Paperclip, Download, Trash2, Sparkles, ArrowRight, Info, Eraser } from 'lucide-react';
import type { Navigate } from '../App';
import { fetchJobs, fetchPrograms, type Job, type Program } from '../api';
import { JOB_CATEGORIES, classifyJob } from '../data/jobs';
import { EMPTY_PROFILE, loadProfile, saveProfile, clearProfile, loadResume, saveResume, deleteResume, type ProfileData, type ResumeFile } from '../lib/profile';
import JobCard from '../components/JobCard';
import ProgramCard from '../components/ProgramCard';

const MAX_FILE = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.hwp,.hwpx,.doc,.docx,.txt,.jpg,.jpeg,.png';

function fileSize(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`;
}

// 희망 직종 이름을 교육과정의 분야·연계 직종과 비교할 키워드로 바꿉니다.
function jobKeywords(desired: string): string[] {
  const cat = JOB_CATEGORIES.find((c) => c.name === desired);
  return cat ? [...desired.split(/[·()]/).filter(Boolean), ...cat.keywords] : [];
}

const Profile = ({ navigate }: { navigate: Navigate }) => {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [resume, setResume] = useState<ResumeFile | null>(null);
  const [fileError, setFileError] = useState<string>();

  const [recJobs, setRecJobs] = useState<Job[]>([]);
  const [recCourses, setRecCourses] = useState<Program[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string>();

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfile(saved);
      setIsEditing(false);
    }
    loadResume().then(setResume);
  }, []);

  // 저장된 희망 직종·지역으로 일자리와 교육과정을 추천합니다.
  useEffect(() => {
    if (isEditing || (!profile.desiredJob && profile.region === '전체')) {
      setRecJobs([]);
      setRecCourses([]);
      return;
    }
    let alive = true;
    setRecLoading(true);
    setRecError(undefined);
    const keywords = jobKeywords(profile.desiredJob);
    const jobsReq =
      profile.region !== '전체'
        ? fetchJobs({ region: profile.region })
        : fetchJobs({ keyword: JOB_CATEGORIES.find((c) => c.name === profile.desiredJob)?.keywords[0], display: 50 });
    Promise.allSettled([jobsReq, fetchPrograms('course')]).then(([j, c]) => {
      if (!alive) return;
      if (j.status === 'fulfilled') {
        const items = profile.desiredJob ? j.value.items.filter((x) => classifyJob(x.title) === profile.desiredJob) : j.value.items;
        setRecJobs(items.slice(0, 5));
      } else {
        setRecError(j.reason instanceof Error ? j.reason.message : '추천 일자리를 불러오지 못했습니다.');
      }
      if (c.status === 'fulfilled') {
        const scored = c.value.items
          .map((p) => {
            const hay = `${p.title} ${p.category} ${p.related_jobs} ${p.summary}`;
            let score = keywords.some((k) => hay.includes(k)) ? 2 : 0;
            if (profile.region !== '전체' && p.region.includes(profile.region)) score += 1;
            return { p, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score);
        setRecCourses(scored.slice(0, 4).map((x) => x.p));
      }
      setRecLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [isEditing, profile.desiredJob, profile.region]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    setSaveStatus('저장되었습니다!');
    setIsEditing(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleClear = async () => {
    if (!window.confirm('이 브라우저에 저장된 프로필과 이력서 파일을 모두 지울까요? (센터 공용 PC에서 상담 후 사용하세요)')) return;
    clearProfile();
    await deleteResume().catch(() => {});
    setProfile(EMPTY_PROFILE);
    setResume(null);
    setIsEditing(true);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileError(undefined);
    if (file.size > MAX_FILE) {
      setFileError('10MB 이하 파일만 첨부할 수 있습니다.');
      return;
    }
    try {
      setResume(await saveResume(file));
    } catch {
      setFileError('이 브라우저에서는 파일을 저장할 수 없습니다. (사생활 보호 모드 등)');
    }
  };

  const downloadResume = () => {
    if (!resume) return;
    const url = URL.createObjectURL(resume.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = resume.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const fields: (keyof ProfileData)[] = ['name', 'birthYear', 'phone', 'desiredJob', 'region', 'experience', 'skills', 'bio'];
  const filled = fields.filter((f) => profile[f].trim() !== '' && !(f === 'region' && profile[f] === '전체')).length + (resume ? 1 : 0);
  const completionScore = Math.round((filled / (fields.length + 1)) * 100);
  const age = profile.birthYear ? new Date().getFullYear() - parseInt(profile.birthYear) + 1 : null;

  const section = (Icon: typeof FileText, title: string, body: string) => (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Icon size={18} />
        {title}
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', lineHeight: 1.7 }}>
        {body || '등록된 내용이 없습니다.'}
      </p>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">내 커리어 프로필</h1>
          <p className="page-subtitle">경력과 희망 직종을 정리해 두시면 알맞은 일자리와 교육과정을 추천해 드리고, 전화상담 신청 시 상담사에게 함께 전달됩니다.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        <div className="notice" style={{ marginBottom: '24px' }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            프로필과 이력서 파일은 <strong>지금 사용 중인 이 기기(브라우저)에만</strong> 저장되고 서버로 보내지지 않습니다. 실명 대신 가명으로 입력해도 추천을 받을 수 있어요. 센터 공용 PC에서는 사용 후
            &nbsp;<strong>프로필 지우기</strong>를 눌러 주세요.
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
          {/* Left panel */}
          <div className="panel" style={{ flex: '1 1 320px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '4px solid var(--border-color)' }}>
              <User size={48} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>{profile.name || '이름을 입력해 주세요'}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{age ? `${profile.birthYear}년생 (${age}세)` : '출생년도 미입력'}</p>

            <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>프로필 완성도</span>
                <span style={{ color: 'var(--primary)' }}>{completionScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionScore}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'left' }}>
                {profile.experience.trim() ? '✅ 경력을 작성하셔서 전화상담을 신청할 수 있어요.' : '💡 경력 사항을 작성하면 전화상담을 신청할 수 있어요.'}
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} /> {profile.phone || '연락처 미입력'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-all' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} /> {profile.email || '이메일 미입력'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} /> {[profile.region !== '전체' ? profile.region : '', profile.location].filter(Boolean).join(' ') || '희망 지역 미입력'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={16} style={{ color: 'var(--primary)' }} /> {profile.desiredJob || '희망 직종 미선택'} · {profile.jobCategory}
              </div>
            </div>

            {/* 이력서 파일 */}
            <div style={{ width: '100%', textAlign: 'left', borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Paperclip size={16} /> 이력서 파일
              </h3>
              {resume ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.88rem', wordBreak: 'break-all' }}>
                    {resume.name} <span style={{ color: 'var(--text-muted)' }}>({fileSize(resume.size)})</span>
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={downloadResume}>
                      <Download size={14} /> 열기·저장
                    </button>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      바꾸기
                      <input type="file" accept={ACCEPT} onChange={onFile} style={{ display: 'none' }} />
                    </label>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async () => {
                        await deleteResume().catch(() => {});
                        setResume(null);
                      }}
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
                  </div>
                </div>
              ) : (
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: '100%' }}>
                  <Paperclip size={14} /> 이력서 파일 첨부 (한글·워드·PDF, 10MB 이하)
                  <input type="file" accept={ACCEPT} onChange={onFile} style={{ display: 'none' }} />
                </label>
              )}
              {fileError && <p style={{ color: 'var(--danger-text)', fontSize: '0.82rem', marginTop: '6px' }}>{fileError}</p>}
              <p className="field-hint" style={{ marginTop: '6px' }}>
                파일은 이 기기에만 보관됩니다. 상담 시 직접 보여 주시거나 저장해서 지원서에 첨부하세요.
              </p>
            </div>

            <button className="btn btn-danger btn-sm" style={{ marginTop: '20px' }} onClick={handleClear}>
              <Eraser size={14} /> 프로필 지우기
            </button>
          </div>

          {/* Right panel */}
          <div className="panel" style={{ flex: '2 1 500px', padding: '36px 30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>경력 및 상세 정보</h2>
              <div>
                {saveStatus && <span style={{ color: 'var(--success-text)', fontSize: '0.9rem', marginRight: '12px', fontWeight: 600 }}>{saveStatus}</span>}
                {!isEditing && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                    정보 수정
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="p-name">이름 (가명 가능)</label>
                    <input id="p-name" type="text" name="name" value={profile.name} onChange={handleChange} placeholder="홍길동" required />
                  </div>
                  <div className="field">
                    <label htmlFor="p-birth">출생년도</label>
                    <input id="p-birth" type="number" name="birthYear" value={profile.birthYear} onChange={handleChange} placeholder="예: 1970" min={1930} max={2010} />
                  </div>
                  <div className="field">
                    <label htmlFor="p-phone">연락처</label>
                    <input id="p-phone" type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="010-0000-0000" />
                  </div>
                  <div className="field">
                    <label htmlFor="p-email">이메일</label>
                    <input id="p-email" type="email" name="email" value={profile.email} onChange={handleChange} placeholder="example@email.com" />
                  </div>
                  <div className="field">
                    <label htmlFor="p-desired">희망 직종</label>
                    <select id="p-desired" name="desiredJob" value={profile.desiredJob} onChange={handleChange}>
                      <option value="">선택해 주세요</option>
                      {JOB_CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="p-type">희망 근무 형태</label>
                    <select id="p-type" name="jobCategory" value={profile.jobCategory} onChange={handleChange}>
                      {['정규직/전문직', '파트타임/알바', '시니어 인턴', '공공/공익형'].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="p-region">희망 지역</label>
                    <select id="p-region" name="region" value={profile.region} onChange={handleChange}>
                      {['전체', '고양', '파주', '김포'].map((r) => (
                        <option key={r} value={r}>
                          {r === '전체' ? '지역 무관' : r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="p-loc">세부 희망 근무지</label>
                    <input id="p-loc" type="text" name="location" value={profile.location} onChange={handleChange} placeholder="예: 금촌동, 일산동구" />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="p-exp">주요 경력 사항</label>
                  <textarea id="p-exp" name="experience" rows={4} value={profile.experience} onChange={handleChange} placeholder="근무했던 직장, 직무, 기간을 적어 주세요. (예: ○○물산 총무팀 15년, 아파트 관리사무소 경리 3년)" />
                  <span className="field-hint">전화상담을 신청하려면 경력 사항이 필요합니다.</span>
                </div>
                <div className="field">
                  <label htmlFor="p-skills">보유 기술 및 자격증 (쉼표로 구분)</label>
                  <textarea id="p-skills" name="skills" rows={2} value={profile.skills} onChange={handleChange} placeholder="예: 엑셀, 요양보호사 1급, 지게차운전기능사, 1종 보통면허" />
                </div>
                <div className="field">
                  <label htmlFor="p-bio">자기소개 및 포부</label>
                  <textarea id="p-bio" name="bio" rows={4} value={profile.bio} onChange={handleChange} placeholder="자유롭게 본인의 강점을 포함해 소개글을 남겨주세요." />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  {loadProfile() && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setProfile(loadProfile() || EMPTY_PROFILE);
                        setIsEditing(false);
                      }}
                    >
                      취소
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} /> 저장하고 추천 받기
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {section(FileText, '자기 소개', profile.bio)}
                {section(Briefcase, '주요 경력 사항', profile.experience)}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Award size={18} />
                    보유 기술 및 강점
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {profile.skills ? (
                      profile.skills
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s) => (
                          <span key={s} className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                            {s}
                          </span>
                        ))
                    ) : (
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>등록된 내용이 없습니다.</span>
                    )}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('counseling')} style={{ alignSelf: 'flex-start' }}>
                  이 프로필로 상담 신청하기 <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 추천 */}
        {!isEditing && (
          <section style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={22} style={{ color: 'var(--primary)' }} /> 나에게 맞는 추천
            </h2>
            {!profile.desiredJob && profile.region === '전체' ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                희망 직종이나 희망 지역을 선택하시면 알맞은 일자리와 교육과정을 추천해 드려요.{' '}
                <button className="link-btn" onClick={() => setIsEditing(true)}>
                  지금 선택하기 →
                </button>
              </p>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
                  {[profile.region !== '전체' && `${profile.region} 지역`, profile.desiredJob && `'${profile.desiredJob}' 직종`].filter(Boolean).join(', ')} 기준으로 찾았어요.
                </p>
                {recLoading && <p style={{ color: 'var(--text-muted)' }}>추천을 준비하는 중입니다...</p>}
                {!recLoading && (
                  <>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>추천 일자리</h3>
                    {recError && <div className="notice notice-error" style={{ marginBottom: '16px' }}>{recError}</div>}
                    {!recError && recJobs.length === 0 && <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>지금은 조건에 맞는 공고가 없어요. 조건을 넓혀 보세요.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {recJobs.map((j) => (
                        <JobCard key={j.id} job={j} />
                      ))}
                    </div>
                    {recJobs.length > 0 && (
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: '16px' }}
                        onClick={() =>
                          navigate('jobs', {
                            ...(profile.region !== '전체' ? { region: profile.region } : {}),
                            ...(profile.desiredJob ? { category: profile.desiredJob } : {}),
                          })
                        }
                      >
                        조건에 맞는 공고 모두 보기 <ArrowRight size={16} />
                      </button>
                    )}

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '36px 0 12px' }}>추천 교육과정</h3>
                    {recCourses.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>
                        조건에 맞는 교육과정이 아직 없어요.{' '}
                        <button className="link-btn" onClick={() => navigate('education')}>
                          전체 교육과정 보기 →
                        </button>
                      </p>
                    ) : (
                      <div className="grid">
                        {recCourses.map((c) => (
                          <ProgramCard key={c.id} p={c} onRelatedJob={(job) => navigate('jobs', { keyword: job })} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;
