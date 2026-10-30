import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { LogOut, ShieldCheck, RefreshCw } from 'lucide-react';
import { adminApi, ApiError, type CounselingRequest, type Org } from '../api';
import { formatRange } from '../components/ProgramCard';

type AdminProgram = Awaited<ReturnType<typeof adminApi.programs>>['items'][number];
type TabKey = 'orgs' | 'counseling' | 'programs';

const ORG_STATUS: Record<Org['status'], { label: string; tone: string }> = {
  pending: { label: '승인 대기', tone: 'warn' },
  approved: { label: '승인', tone: 'good' },
  rejected: { label: '반려', tone: 'danger' },
};

const COUNSEL_STATUS: Record<CounselingRequest['status'], string> = { new: '새 신청', contacted: '연락 완료', done: '상담 완료' };

function when(s?: string | null) {
  if (!s) return '';
  // D1 datetime('now')는 UTC이므로 한국 시간으로 바꿔 보여 줍니다.
  const d = new Date(s.replace(' ', 'T') + (s.includes('Z') || s.includes('+') ? '' : 'Z'));
  return isNaN(d.getTime()) ? s : d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

const Admin = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [loginError, setLoginError] = useState<string>();
  const [tab, setTab] = useState<TabKey>('orgs');

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [center, setCenter] = useState('전체');
  const [error, setError] = useState<string>();

  const loadAll = useCallback(async () => {
    setError(undefined);
    try {
      const [o, c, p] = await Promise.all([adminApi.orgs(), adminApi.counseling(), adminApi.programs()]);
      setOrgs(o.items);
      setRequests(c.items);
      setPrograms(p.items);
      setAuthed(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setAuthed(false);
      else setError(e instanceof Error ? e.message : '불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(undefined);
    try {
      await adminApi.login(pw);
      setPw('');
      await loadAll();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '로그인하지 못했습니다.');
    }
  };

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리하지 못했습니다.');
    }
  };

  const pendingCount = orgs.filter((o) => o.status === 'pending').length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const shownRequests = center === '전체' ? requests : requests.filter((r) => r.center === center);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">센터 관리자</h1>
          <p className="page-subtitle">기관 계정 승인, 상담 신청 확인, 등록된 교육과정·행사 관리를 한 곳에서 합니다.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {authed === null && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>확인 중입니다...</p>}

        {authed === false && (
          <form onSubmit={login} className="panel" style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> 관리자 로그인
            </h2>
            <div className="field">
              <label htmlFor="a-pw">관리자 비밀번호</label>
              <input id="a-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
            </div>
            {loginError && <div className="notice notice-error">{loginError}</div>}
            <button type="submit" className="btn btn-primary">
              로그인
            </button>
          </form>
        )}

        {authed && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadAll}>
                <RefreshCw size={14} /> 새로고침
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  await adminApi.logout().catch(() => {});
                  setAuthed(false);
                }}
              >
                <LogOut size={14} /> 로그아웃
              </button>
            </div>

            <div className="tabs">
              <button className={`tab ${tab === 'orgs' ? 'active' : ''}`} onClick={() => setTab('orgs')}>
                기관 계정 {pendingCount > 0 && <span className="chip chip-warn">{pendingCount} 대기</span>}
              </button>
              <button className={`tab ${tab === 'counseling' ? 'active' : ''}`} onClick={() => setTab('counseling')}>
                상담 신청 {newCount > 0 && <span className="chip chip-danger">{newCount} 새 신청</span>}
              </button>
              <button className={`tab ${tab === 'programs' ? 'active' : ''}`} onClick={() => setTab('programs')}>
                등록 교육·행사 ({programs.length})
              </button>
            </div>

            {error && <div className="notice notice-error" style={{ marginBottom: '16px' }}>{error}</div>}

            {tab === 'orgs' && (
              <div className="panel table-wrap" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>상태</th>
                      <th>기관</th>
                      <th>담당자</th>
                      <th>신청일</th>
                      <th>등록 수</th>
                      <th>처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                          신청한 기관이 없습니다.
                        </td>
                      </tr>
                    )}
                    {orgs.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <span className={`chip chip-${ORG_STATUS[o.status].tone}`}>{ORG_STATUS[o.status].label}</span>
                        </td>
                        <td>
                          <strong>{o.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {[o.org_type, o.region, `ID ${o.login_id}`].filter(Boolean).join(' · ')}
                          </div>
                          {o.homepage && (
                            <a href={o.homepage} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                              홈페이지
                            </a>
                          )}
                          {o.admin_note && <div style={{ fontSize: '0.8rem', color: 'var(--danger-text)' }}>메모: {o.admin_note}</div>}
                        </td>
                        <td>
                          {o.manager}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.phone}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.email}</div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{when(o.created_at)}</td>
                        <td>{o.program_count ?? 0}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {o.status !== 'approved' && (
                            <button className="btn btn-primary btn-sm" style={{ marginRight: '6px' }} onClick={() => act(() => adminApi.setOrgStatus(o.id, 'approved'))}>
                              승인
                            </button>
                          )}
                          {o.status !== 'rejected' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                const note = window.prompt(o.status === 'approved' ? '승인을 취소하는 사유 (기관에 표시됩니다)' : '반려 사유 (기관에 표시됩니다)', '');
                                if (note !== null) act(() => adminApi.setOrgStatus(o.id, 'rejected', note));
                              }}
                            >
                              {o.status === 'approved' ? '승인 취소' : '반려'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'counseling' && (
              <>
                <div className="filter-row" style={{ marginBottom: '14px' }}>
                  {['전체', '고양', '파주'].map((c) => (
                    <button key={c} className={`filter-btn ${center === c ? 'active' : ''}`} onClick={() => setCenter(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="panel table-wrap" style={{ padding: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>신청일</th>
                        <th>센터</th>
                        <th>신청자</th>
                        <th>분야 · 방식</th>
                        <th>내용</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shownRequests.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                            상담 신청이 없습니다.
                          </td>
                        </tr>
                      )}
                      {shownRequests.map((r) => (
                        <tr key={r.id} style={{ backgroundColor: r.status === 'new' ? 'var(--primary-light)' : undefined }}>
                          <td style={{ whiteSpace: 'nowrap' }}>{when(r.created_at)}</td>
                          <td>{r.center}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <strong>{r.name}</strong>
                            <div>
                              <a href={`tel:${r.phone}`}>{r.phone}</a>
                            </div>
                          </td>
                          <td>
                            {r.topic}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {r.method}
                              {r.preferred_time && ` · ${r.preferred_time}`}
                            </div>
                          </td>
                          <td style={{ minWidth: '240px' }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{r.message || '-'}</div>
                            {r.profile_summary && (
                              <details style={{ marginTop: '6px' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.82rem' }}>프로필 요약 보기</summary>
                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.82rem', marginTop: '4px' }}>{r.profile_summary}</pre>
                              </details>
                            )}
                          </td>
                          <td>
                            <select value={r.status} onChange={(e) => act(() => adminApi.setCounselingStatus(r.id, e.target.value as CounselingRequest['status']))} style={{ padding: '6px 8px' }}>
                              {(Object.keys(COUNSEL_STATUS) as CounselingRequest['status'][]).map((s) => (
                                <option key={s} value={s}>
                                  {COUNSEL_STATUS[s]}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === 'programs' && (
              <div className="panel table-wrap" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>구분</th>
                      <th>제목</th>
                      <th>기관</th>
                      <th>기간</th>
                      <th>수정일</th>
                      <th>공개</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                          등록된 교육과정·행사가 없습니다.
                        </td>
                      </tr>
                    )}
                    {programs.map((p) => (
                      <tr key={p.id}>
                        <td>{p.kind === 'course' ? '교육' : '행사'}</td>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td>{p.org_name}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatRange(p.start_date, p.end_date)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{when(p.updated_at)}</td>
                        <td>
                          <label className="check-toggle">
                            <input type="checkbox" checked={!!p.visible} onChange={(e) => act(() => adminApi.setProgramVisible(p.id, e.target.checked))} />
                            {p.visible ? '공개' : '숨김'}
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
