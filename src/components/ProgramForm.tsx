import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Program, ProgramKind } from '../api';
import { COURSE_CATEGORIES, EVENT_CATEGORIES, PROGRAM_REGIONS } from '../data/programs';
import { JOB_CATEGORIES } from '../data/jobs';

export type ProgramDraft = Omit<Program, 'id' | 'org_id' | 'org_name' | 'org_homepage' | 'org_phone' | 'updated_at'>;

export const emptyDraft = (kind: ProgramKind, region = ''): ProgramDraft => ({
  kind,
  title: '',
  category: '',
  region,
  summary: '',
  target: kind === 'course' ? '만 40세 이상 구직자' : '',
  apply_start: '',
  apply_end: '',
  start_date: '',
  end_date: '',
  schedule: '',
  place: '',
  delivery: '대면',
  cost_type: '무료',
  cost_detail: '',
  capacity: '',
  related_jobs: '',
  contact: '',
  apply_url: '',
  visible: 1,
});

// 기관이 교육과정 · 채용행사를 등록/수정하는 양식
const ProgramForm = ({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: ProgramDraft;
  onSubmit: (d: ProgramDraft) => Promise<void>;
  onCancel: () => void;
}) => {
  const [d, setD] = useState<ProgramDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const isCourse = d.kind === 'course';
  const related = d.related_jobs.split(',').map((s) => s.trim()).filter(Boolean);

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setD((p) => ({ ...p, [name]: value }));
  };

  const toggleRelated = (name: string) => {
    const next = related.includes(name) ? related.filter((r) => r !== name) : [...related, name];
    setD((p) => ({ ...p, related_jobs: next.join(', ') }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await onSubmit(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="filter-row">
        <span className="filter-label">구분</span>
        {(['course', 'event'] as const).map((k) => (
          <button type="button" key={k} className={`filter-btn ${d.kind === k ? 'active' : ''}`} onClick={() => setD((p) => ({ ...p, kind: k, category: '' }))}>
            {k === 'course' ? '교육과정' : '채용행사'}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="f-title">{isCourse ? '교육과정명' : '행사명'} *</label>
          <input id="f-title" name="title" value={d.title} onChange={set} required maxLength={120} placeholder={isCourse ? '예: 요양보호사 자격 취득 과정 (주간반)' : '예: 2026 파주 중장년 일자리 박람회'} />
        </div>
        <div className="field">
          <label htmlFor="f-cat">분야</label>
          <select id="f-cat" name="category" value={d.category} onChange={set}>
            <option value="">선택</option>
            {(isCourse ? COURSE_CATEGORIES : EVENT_CATEGORIES).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-region">지역</label>
          <select id="f-region" name="region" value={d.region} onChange={set}>
            <option value="">선택</option>
            {PROGRAM_REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="f-summary">소개 *</label>
          <textarea id="f-summary" name="summary" rows={4} value={d.summary} onChange={set} required maxLength={2000} placeholder={isCourse ? '무엇을 배우는지, 어떤 분께 도움이 되는지 쉽게 적어 주세요.' : '참여 기업, 모집 직종, 준비물 등을 적어 주세요.'} />
        </div>

        <div className="field">
          <label htmlFor="f-start">{isCourse ? '교육 시작일' : '행사 시작일'} *</label>
          <input id="f-start" type="date" name="start_date" value={d.start_date} onChange={set} required />
        </div>
        <div className="field">
          <label htmlFor="f-end">{isCourse ? '교육 종료일' : '행사 종료일 (하루 행사면 비워 두세요)'}</label>
          <input id="f-end" type="date" name="end_date" value={d.end_date} onChange={set} min={d.start_date || undefined} />
        </div>
        <div className="field">
          <label htmlFor="f-as">접수 시작일</label>
          <input id="f-as" type="date" name="apply_start" value={d.apply_start} onChange={set} />
        </div>
        <div className="field">
          <label htmlFor="f-ae">접수 마감일</label>
          <input id="f-ae" type="date" name="apply_end" value={d.apply_end} onChange={set} min={d.apply_start || undefined} />
        </div>
        <div className="field">
          <label htmlFor="f-sch">{isCourse ? '수업 요일·시간' : '행사 시간'}</label>
          <input id="f-sch" name="schedule" value={d.schedule} onChange={set} maxLength={200} placeholder={isCourse ? '예: 월·수·금 09:30~13:30 (총 80시간)' : '예: 14:00~17:00'} />
        </div>
        <div className="field">
          <label htmlFor="f-delivery">진행 방식</label>
          <select id="f-delivery" name="delivery" value={d.delivery} onChange={set}>
            <option>대면</option>
            <option>온라인</option>
            <option>혼합</option>
          </select>
        </div>
        <div className="field full">
          <label htmlFor="f-place">장소</label>
          <input id="f-place" name="place" value={d.place} onChange={set} maxLength={200} placeholder="예: 파주고용복지+센터 8층 교육장 (온라인이면 접속 방법)" />
        </div>

        {isCourse && (
          <>
            <div className="field">
              <label htmlFor="f-cost">교육비</label>
              <select id="f-cost" name="cost_type" value={d.cost_type} onChange={set}>
                <option>무료</option>
                <option>국비지원</option>
                <option>유료</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-costd">교육비 상세</label>
              <input id="f-costd" name="cost_detail" value={d.cost_detail} onChange={set} maxLength={200} placeholder="예: 국민내일배움카드 사용, 자부담 10%" />
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor="f-target">대상</label>
          <input id="f-target" name="target" value={d.target} onChange={set} maxLength={200} placeholder="예: 만 50세 이상 파주시민" />
        </div>
        <div className="field">
          <label htmlFor="f-cap">모집 인원</label>
          <input id="f-cap" name="capacity" value={d.capacity} onChange={set} maxLength={50} placeholder="예: 20명" />
        </div>

        <div className="field full">
          <span className="field-label">{isCourse ? '수료 후 지원 가능한 일자리 (여러 개 선택)' : '참여 분야'}</span>
          <div className="filter-row">
            {JOB_CATEGORIES.map((c) => (
              <button type="button" key={c.name} className={`filter-btn ${related.includes(c.name) ? 'active' : ''}`} onClick={() => toggleRelated(c.name)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                {c.name}
              </button>
            ))}
          </div>
          <span className="field-hint">선택한 직종은 교육 카드에 표시되고, 누르면 해당 채용공고로 바로 이동합니다.</span>
        </div>

        <div className="field">
          <label htmlFor="f-contact">문의 전화</label>
          <input id="f-contact" name="contact" value={d.contact} onChange={set} maxLength={100} placeholder="예: 031-000-0000 (담당 김○○)" />
        </div>
        <div className="field">
          <label htmlFor="f-url">신청 페이지 주소</label>
          <input id="f-url" type="url" name="apply_url" value={d.apply_url} onChange={set} maxLength={500} placeholder="https://" />
        </div>
      </div>

      <label className="check-toggle">
        <input type="checkbox" checked={!!d.visible} onChange={(e) => setD((p) => ({ ...p, visible: e.target.checked ? 1 : 0 }))} /> 사이트에 공개하기 (끄면 저장만 되고 보이지 않습니다)
      </label>

      {error && <div className="notice notice-error">{error}</div>}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? '저장하는 중...' : '저장하기'}
        </button>
      </div>
    </form>
  );
};

export default ProgramForm;
