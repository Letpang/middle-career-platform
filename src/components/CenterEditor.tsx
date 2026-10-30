import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import { orgApi, type CenterPage, type CenterPost } from '../api';
import { SIDO } from '../data/regions';

// 중장년내일센터 계정이 자기 센터 홈페이지(/center/<slug>)를 직접 채우는 화면
// 1) 기본 정보·서비스 안내  2) 공지사항·추천 채용

const PostForm = ({ initial, onSave, onCancel }: { initial: Partial<CenterPost>; onSave: (p: Partial<CenterPost>) => Promise<void>; onCancel: () => void }) => {
  const [p, setP] = useState<Partial<CenterPost>>(initial);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const isJob = p.kind === 'job';
  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setP((x) => ({ ...x, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onSave(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{initial.id ? '수정하기' : isJob ? '추천 채용 올리기' : '공지 올리기'}</h3>
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="p-title">{isJob ? '공고 제목' : '공지 제목'} *</label>
          <input id="p-title" name="title" value={p.title || ''} onChange={set} required maxLength={120} placeholder={isJob ? '예: 아파트 경비원 (주 5일, 60세 이상 가능)' : '예: 11월 재도약 프로그램 참여자 모집'} />
        </div>
        {isJob && (
          <>
            <div className="field">
              <label htmlFor="p-company">회사명</label>
              <input id="p-company" name="company" value={p.company || ''} onChange={set} maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="p-deadline">마감일</label>
              <input id="p-deadline" type="date" name="deadline" value={p.deadline || ''} onChange={set} />
            </div>
          </>
        )}
        <div className="field full">
          <label htmlFor="p-body">{isJob ? '근무 조건·지원 방법' : '내용'}</label>
          <textarea id="p-body" name="body" value={p.body || ''} onChange={set} rows={6} maxLength={3000} />
        </div>
        <div className="field full">
          <label htmlFor="p-link">{isJob ? '공고·지원 주소' : '관련 링크'}</label>
          <input id="p-link" type="url" name="link" value={p.link || ''} onChange={set} maxLength={500} placeholder="https://" />
        </div>
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? '저장 중...' : '저장'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
};

const CenterEditor = () => {
  const [page, setPage] = useState<CenterPage | null>(null);
  const [exists, setExists] = useState(false);
  const [posts, setPosts] = useState<CenterPost[]>([]);
  const [editing, setEditing] = useState<Partial<CenterPost> | null>(null);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([orgApi.center(), orgApi.posts()]);
      setPage(c.page);
      setExists(c.exists);
      setPosts(p.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!page) return error ? <div className="notice notice-error">{error}</div> : <p style={{ color: 'var(--text-muted)' }}>불러오는 중입니다...</p>;

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setPage((p) => p && { ...p, [e.target.name]: e.target.value });
  const setService = (i: number, key: 'title' | 'target' | 'desc', value: string) =>
    setPage((p) => p && { ...p, services: p.services.map((s, j) => (j === i ? { ...s, [key]: value } : s)) });
  const [sidoName, areaName] = page.job_region.split(' ');
  const areas = SIDO.find((s) => s.name === sidoName)?.areas || [];

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(undefined), 5000);
  };

  const savePage = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await orgApi.saveCenter(page);
      setExists(true);
      flash('저장했습니다. 센터 홈페이지에 바로 반영됩니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const savePost = async (p: Partial<CenterPost>) => {
    if (p.id) await orgApi.updatePost(p.id, p);
    else await orgApi.createPost(p);
    setPosts((await orgApi.posts()).items);
    setEditing(null);
    flash('저장했습니다.');
  };

  const removePost = async (p: CenterPost) => {
    if (!window.confirm(`'${p.title}'을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try {
      await orgApi.removePost(p.id);
      setPosts((await orgApi.posts()).items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다.');
    }
  };

  const homeUrl = `/center/${encodeURIComponent(page.slug)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {message && <div className="notice notice-success">{message}</div>}
      {error && <div className="notice notice-error">{error}</div>}

      {exists && page.published ? (
        <div className="notice notice-success">
          <span>
            센터 홈페이지 주소:{' '}
            <a href={homeUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
              {window.location.origin}
              {decodeURIComponent(homeUrl)} <ExternalLink size={14} style={{ verticalAlign: 'middle' }} />
            </a>
          </span>
        </div>
      ) : (
        <div className="notice notice-warn">
          <span>아래 내용을 채우고 저장하면 센터 홈페이지가 열립니다. 교육·채용행사는 「교육·행사」 탭에서 올린 것이 함께 보입니다.</span>
        </div>
      )}

      <form onSubmit={savePage} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>기본 정보</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="c-slug">홈페이지 주소 *</label>
            <input id="c-slug" name="slug" value={page.slug} onChange={set} required minLength={2} maxLength={20} placeholder="예: 고양" />
            <span className="field-hint">/center/{page.slug || '○○'} — 한글·영문 소문자·숫자 2~20자</span>
          </div>
          <div className="field">
            <label htmlFor="c-operator">운영기관</label>
            <input id="c-operator" name="operator" value={page.operator} onChange={set} maxLength={60} placeholder="예: 고양상공회의소" />
          </div>
          <div className="field full">
            <label htmlFor="c-intro">센터 소개</label>
            <textarea id="c-intro" name="intro" value={page.intro} onChange={set} rows={3} maxLength={1000} placeholder="예: 40세 이상 재직자·퇴직(예정)자의 생애경력설계, 전직지원, 재취업을 무료로 도와드립니다." />
          </div>
          <div className="field full">
            <label htmlFor="c-address">주소</label>
            <input id="c-address" name="address" value={page.address} onChange={set} maxLength={200} />
          </div>
          <div className="field">
            <label htmlFor="c-phone">대표 전화</label>
            <input id="c-phone" name="phone" value={page.phone} onChange={set} maxLength={40} />
          </div>
          <div className="field">
            <label htmlFor="c-hours">운영시간</label>
            <input id="c-hours" name="hours" value={page.hours} onChange={set} maxLength={100} />
          </div>
          <div className="field full">
            <label htmlFor="c-map">지도 주소 (비워 두면 주소로 네이버 지도를 엽니다)</label>
            <input id="c-map" type="url" name="map_url" value={page.map_url} onChange={set} maxLength={500} placeholder="https://" />
          </div>
          <div className="field full">
            <label>채용정보 지역 (고용24 공고를 함께 보여 줍니다)</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                aria-label="시·도"
                value={sidoName || ''}
                onChange={(e) => {
                  const s = SIDO.find((x) => x.name === e.target.value);
                  setPage((p) => p && { ...p, job_region: s ? `${s.name} ${s.areas[0][1]}` : '' });
                }}
              >
                <option value="">보여 주지 않음</option>
                {SIDO.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
              {sidoName && (
                <select aria-label="시·군·구" value={areaName} onChange={(e) => setPage((p) => p && { ...p, job_region: `${sidoName} ${e.target.value}` })}>
                  {areas.map(([code, name]) => (
                    <option key={code} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '10px' }}>서비스 안내</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '-10px' }}>전국 중장년내일센터 공통 서비스를 미리 채워 두었습니다. 센터에 맞게 고치거나 빼세요.</p>
        {page.services.map((s, i) => (
          <div key={i} className="form-grid" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', position: 'relative' }}>
            <div className="field">
              <label htmlFor={`s-title-${i}`}>서비스 이름 *</label>
              <input id={`s-title-${i}`} value={s.title} onChange={(e) => setService(i, 'title', e.target.value)} required maxLength={40} />
            </div>
            <div className="field">
              <label htmlFor={`s-target-${i}`}>대상</label>
              <input id={`s-target-${i}`} value={s.target} onChange={(e) => setService(i, 'target', e.target.value)} maxLength={60} />
            </div>
            <div className="field full">
              <label htmlFor={`s-desc-${i}`}>설명</label>
              <textarea id={`s-desc-${i}`} value={s.desc} onChange={(e) => setService(i, 'desc', e.target.value)} rows={2} maxLength={300} />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ position: 'absolute', top: '10px', right: '10px' }}
              onClick={() => setPage((p) => p && { ...p, services: p.services.filter((_, j) => j !== i) })}
              aria-label={`${s.title || '서비스'} 빼기`}
            >
              <X size={14} /> 빼기
            </button>
          </div>
        ))}
        {page.services.length < 12 && (
          <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setPage((p) => p && { ...p, services: [...p.services, { title: '', target: '', desc: '' }] })}>
            <Plus size={14} /> 서비스 추가
          </button>
        )}

        <label className="check-toggle">
          <input type="checkbox" checked={!!page.published} onChange={(e) => setPage((p) => p && { ...p, published: e.target.checked ? 1 : 0 })} /> 센터 홈페이지 공개하기
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? '저장 중...' : '기본 정보 저장'}
        </button>
      </form>

      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>공지사항·추천 채용 ({posts.length})</h2>
          {!editing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing({ kind: 'notice' })}>
                <Plus size={14} /> 공지 올리기
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing({ kind: 'job' })}>
                <Plus size={14} /> 추천 채용 올리기
              </button>
            </div>
          )}
        </div>
        {editing ? (
          <PostForm key={editing.id || editing.kind} initial={editing} onSave={savePost} onCancel={() => setEditing(null)} />
        ) : posts.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text-muted)' }}>
            아직 올린 글이 없습니다.
          </div>
        ) : (
          <div className="panel table-wrap" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>제목</th>
                  <th>올린 날</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.kind === 'job' ? '추천 채용' : '공지'}</td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{p.created_at.slice(0, 10).replace(/-/g, '.')}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)} style={{ marginRight: '6px' }}>
                        <Pencil size={14} /> 수정
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => removePost(p)}>
                        <Trash2 size={14} /> 삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterEditor;
