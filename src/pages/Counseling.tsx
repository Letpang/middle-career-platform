import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CircleCheck, MessageCircle, Phone, PhoneCall, Users, Send, ChevronDown, Info, TriangleAlert } from 'lucide-react';
import type { Navigate } from '../App';
import { submitCounseling } from '../api';
import { CENTERS } from '../data/links';
import { loadProfile, profileSummary } from '../lib/profile';

const TOPICS = ['이력서 · 자기소개서 클리닉', '면접 준비', '진로 · 재취업 방향 설계', '생애경력설계·재도약', '창업 상담', '디지털 역량 상담', '기타 고민 상담'];

const METHODS = [
  { value: '방문상담', icon: Users, desc: '센터에 직접 방문하여 상담받으실 수 있습니다' },
  { value: '전화상담', icon: Phone, desc: '프로필에 경력을 작성하신 분께 상담사가 전화드립니다' },
] as const;

const FAQ = [
  { q: '상담은 무료인가요?', a: '네, 중장년내일센터의 1:1 상담은 무료로 제공됩니다. 부담 없이 신청해 주세요.' },
  { q: '상담 신청 후 얼마나 기다려야 하나요?', a: '신청서 접수 후 영업일 기준 1~2일 이내에 담당 상담사가 입력하신 연락처로 직접 연락드립니다.' },
  { q: '전화상담은 왜 프로필을 먼저 써야 하나요?', a: '상담사가 미리 경력과 희망 조건을 확인해야 짧은 통화로도 알찬 상담을 해 드릴 수 있기 때문입니다. 프로필 작성이 어려우시면 방문상담을 선택하시거나 센터로 바로 전화 주세요.' },
  { q: '국민취업지원제도에 참여 중인데 신청해도 되나요?', a: '국민취업지원제도 참여 중이시면 담당 상담사와 먼저 상의해 주세요. 중복 지원 여부는 센터에서 확인 후 안내해 드립니다.' },
  { q: '컴퓨터 사용이 서툴러도 신청할 수 있나요?', a: '물론입니다. 방문상담을 선택하시거나 지역센터로 바로 전화 주시면 화면 조작 없이도 상담받으실 수 있습니다.' },
];

const Counseling = ({ navigate }: { navigate: Navigate }) => {
  const profile = useMemo(() => loadProfile(), []);
  const summary = useMemo(() => profileSummary(profile), [profile]);
  const hasProfile = summary.length > 0;
  const initialTopic = useMemo(() => {
    const t = new URLSearchParams(window.location.search).get('topic') || '';
    return TOPICS.includes(t) ? t : TOPICS[0];
  }, []);

  const blank = () => ({
    center: '파주',
    name: profile?.name || '',
    phone: profile?.phone || '',
    topic: initialTopic,
    method: '방문상담',
    preferredTime: '',
    message: '',
  });

  const [form, setForm] = useState(blank);
  const [consent, setConsent] = useState(false);
  const [attachProfile, setAttachProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const phoneBlocked = form.method === '전화상담' && !hasProfile;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (phoneBlocked) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await submitCounseling({
        center: form.center,
        name: form.name,
        phone: form.phone,
        topic: form.topic,
        method: form.method,
        preferred_time: form.preferredTime,
        message: form.message,
        profile_summary: form.method === '전화상담' || attachProfile ? summary : '',
        consent,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청을 접수하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const center = CENTERS.find((c) => c.region === form.center);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">1:1 커리어 상담지원</h1>
          <p className="page-subtitle">혼자 고민하지 마세요. 이력서, 면접, 진로 방향까지 중장년내일센터 상담사가 눈높이에 맞춰 함께 이야기 나눕니다. 모든 상담은 무료입니다.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        <div className="grid" style={{ marginBottom: '50px' }}>
          {[
            { step: '1', title: '신청서 작성', desc: '상담 받을 센터와 분야, 방식(방문·전화)을 선택해 주세요.' },
            { step: '2', title: '상담사 배정 및 연락', desc: '영업일 기준 1~2일 내 담당 상담사가 직접 연락드립니다.' },
            { step: '3', title: '1:1 맞춤 상담 진행', desc: '방문 또는 전화로 약 30분간 상담을 진행합니다.' },
            { step: '4', title: '맞춤 정보 안내', desc: '상담 내용을 바탕으로 알맞은 일자리와 교육 과정을 추천해 드립니다.' },
          ].map((s) => (
            <div className="card" key={s.step}>
              <div className="card-icon-container" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {s.step}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
          <div className="panel" style={{ flex: '2 1 480px', padding: '36px 30px' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CircleCheck size={36} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>상담 신청이 접수되었습니다</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  {form.name}님, 신청해 주셔서 감사합니다. 영업일 기준 1~2일 이내에 {center?.centerName} 상담사가 <strong style={{ color: 'var(--text-primary)' }}>{form.phone}</strong>로 연락드리겠습니다.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setForm(blank());
                    setConsent(false);
                    setDone(false);
                  }}
                >
                  다른 상담 추가로 신청하기
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <MessageCircle size={22} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>상담 신청서</h2>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="field">
                    <span className="field-label">상담 받을 센터</span>
                    <div className="filter-row">
                      {CENTERS.map((c) => (
                        <button type="button" key={c.region} className={`filter-btn ${form.center === c.region ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, center: c.region }))}>
                          {c.region} ({c.phone})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="c-name">이름</label>
                      <input id="c-name" type="text" name="name" value={form.name} onChange={onChange} placeholder="홍길동" required maxLength={40} />
                    </div>
                    <div className="field">
                      <label htmlFor="c-phone">연락처</label>
                      <input id="c-phone" type="tel" name="phone" value={form.phone} onChange={onChange} placeholder="010-0000-0000" required maxLength={20} />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="c-topic">상담 분야</label>
                    <select id="c-topic" name="topic" value={form.topic} onChange={onChange}>
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <span className="field-label">상담 방식</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {METHODS.map((m) => {
                        const Icon = m.icon;
                        const sel = form.method === m.value;
                        return (
                          <button
                            type="button"
                            key={m.value}
                            onClick={() => setForm((f) => ({ ...f, method: m.value }))}
                            aria-pressed={sel}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: '8px',
                              padding: '14px',
                              borderRadius: '10px',
                              border: `2px solid ${sel ? 'var(--primary)' : 'var(--border-color)'}`,
                              backgroundColor: sel ? 'var(--primary-light)' : 'var(--bg-primary)',
                              textAlign: 'left',
                            }}
                          >
                            <Icon size={20} style={{ color: sel ? 'var(--primary)' : 'var(--text-secondary)' }} />
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: sel ? 'var(--primary)' : 'var(--text-primary)' }}>{m.value}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {phoneBlocked && (
                    <div className="notice notice-warn">
                      <TriangleAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>
                        전화상담은 <strong>프로필에 경력 사항을 먼저 작성</strong>하신 뒤 신청할 수 있어요. 상담사가 미리 경력을 확인해야 통화 시간을 알차게 쓸 수 있습니다.
                        <br />
                        <button type="button" className="link-btn" onClick={() => navigate('profile')}>
                          프로필 작성하러 가기 →
                        </button>{' '}
                        또는 방문상담을 선택해 주세요.
                      </span>
                    </div>
                  )}

                  {hasProfile && (
                    <div className="field">
                      {form.method === '전화상담' ? (
                        <span className="field-hint">전화상담은 아래 프로필 요약이 상담사에게 함께 전달됩니다.</span>
                      ) : (
                        <label className="check-toggle">
                          <input type="checkbox" checked={attachProfile} onChange={(e) => setAttachProfile(e.target.checked)} /> 내 프로필 요약을 상담사에게 함께 보내기
                        </label>
                      )}
                      {(form.method === '전화상담' || attachProfile) && (
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', maxHeight: '160px', overflowY: 'auto' }}>
                          {summary}
                        </pre>
                      )}
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="c-time">희망 상담 시간대</label>
                    <input id="c-time" type="text" name="preferredTime" value={form.preferredTime} onChange={onChange} placeholder="예: 평일 오전, 화요일 오후 2시 이후 등" maxLength={100} />
                  </div>

                  <div className="field">
                    <label htmlFor="c-msg">상담받고 싶은 내용</label>
                    <textarea id="c-msg" name="message" rows={4} value={form.message} onChange={onChange} placeholder="현재 고민이나 궁금하신 점을 편하게 적어 주세요." maxLength={2000} />
                  </div>

                  <div className="notice" style={{ fontSize: '0.83rem' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>
                      <strong>개인정보 수집·이용 안내</strong> — 수집 항목: 이름, 연락처, 상담 내용{hasProfile ? ', 프로필 요약(선택 시)' : ''} / 목적: 상담 연락 및 진행 / 보관: 상담 종료 후 1년 이내 파기 / 동의를 거부하실 수 있으며, 이 경우 센터로 전화 신청해 주세요.
                    </span>
                  </div>
                  <label className="check-toggle">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /> 개인정보 수집·이용에 동의합니다 (필수)
                  </label>

                  {error && <div className="notice notice-error">{error}</div>}

                  <button type="submit" className="btn btn-primary" disabled={submitting || phoneBlocked || !consent} style={{ marginTop: '4px' }}>
                    <Send size={18} />
                    {submitting ? '접수하는 중...' : '상담 신청하기'}
                  </button>
                </form>
              </>
            )}
          </div>

          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ backgroundColor: 'var(--primary-light)', border: 'none', height: 'auto' }}>
              <div className="card-icon-container" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <PhoneCall size={22} />
              </div>
              <h3>급하신가요? 바로 전화 주세요</h3>
              <p>인터넷 신청이 어려우시면 아래 번호로 바로 전화 주셔도 상담 예약을 도와드립니다.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                {CENTERS.map((c) => (
                  <a key={c.region} href={`tel:${c.phone}`}>
                    {c.region}센터 {c.phone}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>자주 묻는 질문</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {FAQ.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className="card" style={{ padding: '16px 20px', height: 'auto', cursor: 'pointer' }} onClick={() => setOpenFaq(open ? null : i)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{f.q}</span>
                        <ChevronDown size={18} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
                      </div>
                      {open && <p style={{ fontSize: '0.9rem', marginTop: '10px', marginBottom: 0, lineHeight: 1.6 }}>{f.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counseling;
