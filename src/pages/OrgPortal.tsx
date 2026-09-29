import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { LogOut, Plus, Pencil, Trash2, Clock, Ban, School, Eye, EyeOff } from 'lucide-react';
import { orgApi, ApiError, type Org, type Program } from '../api';
import { ORG_TYPES, PROGRAM_REGIONS } from '../data/programs';
import ProgramForm, { emptyDraft, type ProgramDraft } from '../components/ProgramForm';
import { formatRange, programStatus } from '../components/ProgramCard';

type Mode = { type: 'list' } | { type: 'new' } | { type: 'edit'; program: Program };

const LoginForm = ({ onDone }: { onDone: () => void }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await orgApi.login(id, pw);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
      <div className="field">
        <label htmlFor="o-id">아이디</label>
        <input id="o-id" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="o-pw">비밀번호</label>
        <input id="o-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};

const RegisterForm = ({ onDone }: { onDone: () => void }) => {
  const [f, setF] = useState({ login_id: '', password: '', password2: '', name: '', org_type: '', region: '', manager: '', phone: '', email: '', homepage: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.password !== f.password2) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const { password2: _unused, ...body } = f;
      void _unused;
      await orgApi.register(body);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="r-name">기관명 *</label>
          <input id="r-name" name="name" value={f.name} onChange={set} required maxLength={80} placeholder="예: ○○대학교 평생교육원" />
        </div>
        <div className="field">
          <label htmlFor="r-type">기관 유형</label>
          <select id="r-type" name="org_type" value={f.org_type} onChange={set}>
            <option value="">선택</option>
            {ORG_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="r-region">지역</label>
          <select id="r-region" name="region" value={f.region} onChange={set}>
            <option value="">선택</option>
            {PROGRAM_REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="r-manager">담당자 이름 *</label>
          <input id="r-manager" name="manager" value={f.manager} onChange={set} required maxLength={40} />
        </div>
        <div className="field">
          <label htmlFor="r-phone">담당자 연락처 *</label>
          <input id="r-phone" name="phone" value={f.phone} onChange={set} required maxLength={40} placeholder="031-000-0000" />
        </div>
        <div className="field">
          <label htmlFor="r-email">이메일</label>
          <input id="r-email" type="email" name="email" value={f.email} onChange={set} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="r-home">기관 홈페이지</label>
          <input id="r-home" type="url" name="homepage" value={f.homepage} onChange={set} maxLength={500} placeholder="https://" />
        </div>
        <div className="field">
          <label htmlFor="r-id">사용할 아이디 *</label>
          <input id="r-id" name="login_id" value={f.login_id} onChange={set} required minLength={4} maxLength={30} pattern="[a-zA-Z0-9_.\-]+" autoComplete="username" />
          <span className="field-hint">영문·숫자 4~30자</span>
        </div>
        <div className="field" />
        <div className="field">
          <label htmlFor="r-pw">비밀번호 *</label>
          <input id="r-pw" type="password" name="password" value={f.password} onChange={set} required minLength={8} autoComplete="new-password" />
          <span className="field-hint">8자 이상</span>
        </div>
        <div className="field">
          <label htmlFor="r-pw2">비밀번호 확인 *</label>
          <input id="r-pw2" type="password" name="password2" value={f.password2} onChange={set} required minLength={8} autoComplete="new-password" />
        </div>
      </div>
      <label className="check-toggle">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required /> 담당자 이름·연락처·이메일을 기관 확인과 연락 목적으로 수집·이용하는 데 동의합니다 (필수)
      </label>
      {error && <div className="notice notice-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={busy || !agree} style={{ alignSelf: 'flex-start' }}>
        {busy ? '신청하는 중...' : '기관 계정 신청하기'}
      </button>
    </form>
  );
};

const OrgPortal = () => {
  const [org, setOrg] = useState<Org | null>(null);
  const [checking, setChecking] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [registered, setRegistered] = useState(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [message, setMessage] = useState<string>();

  const refreshMe = useCallback(async () => {
    try {
      const { org } = await orgApi.me();
      setOrg(org);
      if (org.status === 'approved') setPrograms((await orgApi.programs()).items);
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) setMessage(e instanceof Error ? e.message : undefined);
      setOrg(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const logout = async () => {
    await orgApi.logout().catch(() => {});
    setOrg(null);
    setPrograms([]);
    setMode({ type: 'list' });
  };

  const save = async (d: ProgramDraft) => {
    if (mode.type === 'edit') await orgApi.update(mode.program.id, d);
    else await orgApi.create(d);
    setPrograms((await orgApi.programs()).items);
    setMode({ type: 'list' });
    setMessage('저장되었습니다. 공개로 설정한 항목은 사이트에 바로 나타납니다.');
    setTimeout(() => setMessage(undefined), 4000);
  };

  const remove = async (p: Program) => {
    if (!window.confirm(`'${p.title}'을(를) 삭제할까요? 삭제하면 되돌릴 수 없습니다. 잠시 숨기려면 수정에서 '사이트에 공개하기'를 끄세요.`)) return;
    try {
      await orgApi.remove(p.id);
      setPrograms((await orgApi.programs()).items);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '삭제하지 못했습니다.');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">교육기관 등록·관리</h1>
          <p className="page-subtitle">기관 계정을 신청하시면 센터 승인 후 교육과정과 채용행사를 직접 등록하고 수정할 수 있습니다.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {checking && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>확인 중입니다...</p>}

        {!checking && !org && (
          <div className="panel" style={{ maxWidth: '760px', margin: '0 auto', padding: '32px' }}>
            {registered ? (
              <div className="notice notice-success" style={{ marginBottom: '20px' }}>
                계정 신청이 접수되었습니다. 센터에서 기관 정보를 확인한 뒤 승인해 드립니다. 승인 전에도 로그인해서 진행 상태를 확인하실 수 있어요.
              </div>
            ) : null}
            <div className="tabs">
              <button className={`tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>
                로그인
              </button>
              <button className={`tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>
                기관 계정 신청
              </button>
            </div>
            {authTab === 'login' ? (
              <LoginForm onDone={refreshMe} />
            ) : (
              <RegisterForm
                onDone={() => {
                  setRegistered(true);
                  setAuthTab('login');
                }}
              />
            )}
            {message && <div className="notice notice-error" style={{ marginTop: '16px' }}>{message}</div>}
          </div>
        )}

        {!checking && org && (
          <>
            <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="card-icon-container" style={{ marginBottom: 0 }}>
                  <School size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{org.name}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {[org.org_type, org.region, `담당 ${org.manager}`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                <LogOut size={14} /> 로그아웃
              </button>
            </div>

            {org.status === 'pending' && (
              <div className="notice notice-warn">
                <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>센터에서 기관 정보를 확인하고 있습니다. 승인되면 교육과정과 채용행사를 등록할 수 있어요. 급하시면 센터로 연락 주세요.</span>
              </div>
            )}
            {org.status === 'rejected' && (
              <div className="notice notice-error">
                <Ban size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  계정 신청이 반려되었습니다.{org.admin_note && ` 사유: ${org.admin_note}`} 문의는 센터로 연락 주세요.
                </span>
              </div>
            )}

            {org.status === 'approved' && (
              <>
                {message && <div className="notice notice-success" style={{ marginBottom: '16px' }}>{message}</div>}
                {mode.type === 'list' ? (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>등록한 교육과정·행사 ({programs.length})</h2>
                      <button className="btn btn-primary" onClick={() => setMode({ type: 'new' })}>
                        <Plus size={18} /> 새로 등록하기
                      </button>
                    </div>
                    {programs.length === 0 ? (
                      <div className="panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        아직 등록한 항목이 없습니다. <strong>새로 등록하기</strong>를 눌러 첫 교육과정을 올려 보세요.
                      </div>
                    ) : (
                      <div className="panel table-wrap" style={{ padding: 0 }}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>구분</th>
                              <th>제목</th>
                              <th>기간</th>
                              <th>상태</th>
                              <th>공개</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {programs.map((p) => {
                              const st = programStatus(p);
                              return (
                                <tr key={p.id}>
                                  <td>{p.kind === 'course' ? '교육' : '행사'}</td>
                                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{formatRange(p.start_date, p.end_date)}</td>
                                  <td>
                                    <span className={`chip chip-${st.tone}`}>{st.label}</span>
                                  </td>
                                  <td>{p.visible ? <Eye size={16} aria-label="공개" /> : <EyeOff size={16} aria-label="비공개" style={{ color: 'var(--text-muted)' }} />}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setMode({ type: 'edit', program: p })} style={{ marginRight: '6px' }}>
                                      <Pencil size={14} /> 수정
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                                      <Trash2 size={14} /> 삭제
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="panel" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>{mode.type === 'edit' ? '수정하기' : '새로 등록하기'}</h2>
                    <ProgramForm
                      key={mode.type === 'edit' ? mode.program.id : 'new'}
                      initial={mode.type === 'edit' ? { ...mode.program } : emptyDraft('course', PROGRAM_REGIONS.includes(org.region) ? org.region : '')}
                      onSubmit={save}
                      onCancel={() => setMode({ type: 'list' })}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrgPortal;
