import { useState } from 'react';
import { ChevronDown, ExternalLink, LoaderCircle, MapPin } from 'lucide-react';
import { fetchJobDetail, type Job, type JobDetail } from '../api';
import { classifyJob, daysLeft, titleTags } from '../data/jobs';

// 공고를 누르기 전에 근무지·급여·근무형태·경력·마감 등 핵심 조건을 한눈에 보여 주고,
// "상세 조건 펼치기"로 근무시간·자격·4대보험 등을 사이트 안에서 바로 확인합니다.
const JobCard = ({ job }: { job: Job }) => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const tags = titleTags(job.title);
  const left = daysLeft(job.closingDate);
  const category = classifyJob(job.title);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !detail && !loading) {
      setLoading(true);
      setError(undefined);
      try {
        setDetail(await fetchJobDetail(job.id));
      } catch (e) {
        setError(e instanceof Error ? e.message : '상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <article className="card" style={{ padding: '24px 28px', transform: 'none', height: 'auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span className="badge badge-primary">{category}</span>
        {job.postedDate && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>등록일 {job.postedDate}</span>}
        {left !== null && left >= 0 && left <= 7 && <span className="chip chip-danger">마감 {left === 0 ? '오늘' : `D-${left}`}</span>}
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', lineHeight: 1.4 }}>{job.title}</h3>
      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 0, flexGrow: 0 }}>{job.company}</p>

      <div className="fact-grid">
        <div className="fact">
          <span className="fact-label">근무지</span>
          <span className="fact-value" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <MapPin size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            {job.location || '-'}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">급여</span>
          <span className="fact-value" style={{ color: 'var(--success-text)' }}>{job.salary}</span>
        </div>
        <div className="fact">
          <span className="fact-label">근무형태</span>
          <span className="fact-value">{[job.type, job.empType].filter(Boolean).join(' · ') || '-'}</span>
        </div>
        <div className="fact">
          <span className="fact-label">경력 / 학력</span>
          <span className="fact-value">{[job.career || '관계없음', job.education || '학력무관'].join(' / ')}</span>
        </div>
        <div className="fact">
          <span className="fact-label">마감</span>
          <span className="fact-value">{job.closingDate || '채용시까지'}</span>
        </div>
      </div>

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {tags.map((t) => (
            <span key={t.label} className={`chip chip-${t.tone}`}>
              {t.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={toggle} aria-expanded={open} style={{ flex: '1 1 200px' }}>
          {open ? '상세 조건 접기' : '상세 조건 펼치기 (근무시간·자격·보험)'}
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {job.url ? (
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: '1 1 200px' }}>
            고용24에서 지원하기 <ExternalLink size={16} />
          </a>
        ) : (
          <button className="btn btn-primary" disabled style={{ flex: '1 1 200px' }}>
            지원 링크 준비중
          </button>
        )}
      </div>

      {open && (
        <div>
          {loading && (
            <p style={{ marginTop: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LoaderCircle size={16} className="spin" /> 상세 조건을 불러오는 중입니다...
            </p>
          )}
          {error && <div className="notice notice-error" style={{ marginTop: '14px' }}>{error}</div>}
          {detail && detail.fields.length === 0 && <p style={{ marginTop: '14px', color: 'var(--text-muted)' }}>등록된 상세 조건이 없습니다. 고용24 공고에서 확인해 주세요.</p>}
          {detail && detail.fields.length > 0 && (
            <dl className="detail-list">
              {detail.fields.map((f) => (
                <div key={f.label} style={{ display: 'contents' }}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </article>
  );
};

export default JobCard;
