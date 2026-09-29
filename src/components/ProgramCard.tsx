import { Building2, CalendarDays, ExternalLink, MapPin, Phone, Wallet, Monitor } from 'lucide-react';
import type { Program } from '../api';

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function programStatus(p: Program): { label: string; tone: 'good' | 'warn' | 'danger' | 'info' } {
  const today = todayStr();
  const end = p.end_date || p.start_date;
  if (end < today) return { label: '종료', tone: 'danger' };
  if (p.apply_end && p.apply_end < today) return { label: '접수 마감', tone: 'danger' };
  if (p.apply_start && p.apply_start > today) return { label: '접수 예정', tone: 'warn' };
  if (p.start_date <= today) return { label: '진행 중', tone: 'info' };
  return { label: '모집 중', tone: 'good' };
}

export function formatRange(a: string, b: string) {
  if (!a) return '';
  if (!b || a === b) return a.replace(/-/g, '.');
  return `${a.replace(/-/g, '.')} ~ ${b.replace(/-/g, '.')}`;
}

// 교육과정 · 채용행사 카드. onRelatedJob 을 주면 "수료 후 연계 직종"을 눌러 일자리 검색으로 이동합니다.
const ProgramCard = ({ p, onRelatedJob }: { p: Program; onRelatedJob?: (job: string) => void }) => {
  const status = programStatus(p);
  const related = p.related_jobs
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="card" style={{ gap: '10px', height: 'auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <span className={`chip chip-${status.tone}`}>{status.label}</span>
        {p.category && <span className="badge badge-primary">{p.category}</span>}
        {p.region && <span className="badge badge-secondary">{p.region}</span>}
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: 0, lineHeight: 1.4 }}>{p.title}</h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 0, flexGrow: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Building2 size={15} /> {p.org_name}
      </p>
      <p style={{ fontSize: '0.9rem', marginBottom: 0, whiteSpace: 'pre-wrap' }}>{p.summary}</p>

      <div className="fact-grid" style={{ margin: '4px 0' }}>
        <div className="fact">
          <span className="fact-label">{p.kind === 'event' ? '행사 일시' : '교육 기간'}</span>
          <span className="fact-value" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <CalendarDays size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            {formatRange(p.start_date, p.end_date)}
          </span>
          {p.schedule && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.schedule}</span>}
        </div>
        {p.kind === 'course' && (
          <div className="fact">
            <span className="fact-label">교육비</span>
            <span className="fact-value" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Wallet size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              {p.cost_type}
            </span>
            {p.cost_detail && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.cost_detail}</span>}
          </div>
        )}
        <div className="fact">
          <span className="fact-label">방식 · 장소</span>
          <span className="fact-value" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {p.delivery === '온라인' ? <Monitor size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} /> : <MapPin size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />}
            {p.delivery}
          </span>
          {p.place && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.place}</span>}
        </div>
        {(p.apply_start || p.apply_end) && (
          <div className="fact">
            <span className="fact-label">접수 기간</span>
            <span className="fact-value">{formatRange(p.apply_start, p.apply_end) || `~ ${p.apply_end.replace(/-/g, '.')}`}</span>
          </div>
        )}
        {p.target && (
          <div className="fact">
            <span className="fact-label">대상</span>
            <span className="fact-value">{p.target}</span>
          </div>
        )}
        {p.capacity && (
          <div className="fact">
            <span className="fact-label">모집 인원</span>
            <span className="fact-value">{p.capacity}</span>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <span className="fact-label" style={{ display: 'block', marginBottom: '6px' }}>
            {p.kind === 'event' ? '참여 분야' : '수료 후 지원 가능한 일자리'}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {related.map((r) =>
              onRelatedJob ? (
                <button key={r} className="chip chip-info" onClick={() => onRelatedJob(r)} title={`'${r}' 채용공고 보기`}>
                  {r} 공고 보기 →
                </button>
              ) : (
                <span key={r} className="chip chip-info">
                  {r}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: 'auto', paddingTop: '6px' }}>
        {(p.contact || p.org_phone) && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} /> {p.contact || p.org_phone}
          </span>
        )}
        {(p.apply_url || p.org_homepage) && (
          <a
            href={p.apply_url || p.org_homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            {p.apply_url ? (p.kind === 'event' ? '참가 신청' : '신청하기') : '기관 홈페이지'} <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
};

export default ProgramCard;
