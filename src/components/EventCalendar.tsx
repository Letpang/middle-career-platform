import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Program } from '../api';
import ProgramCard, { todayStr } from './ProgramCard';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 기관이 등록한 채용행사를 월별 달력과 목록으로 보여 줍니다.
const EventCalendar = ({ events }: { events: Program[] }) => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const today = todayStr();

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const eventsOn = (day: string) => events.filter((e) => e.start_date <= day && (e.end_date || e.start_date) >= day);

  const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
  const listed = selected
    ? eventsOn(selected)
    : events.filter((e) => e.start_date.slice(0, 7) <= monthKey && (e.end_date || e.start_date).slice(0, 7) >= monthKey);

  const move = (delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
    setSelected(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => move(-1)} aria-label="이전 달">
          <ChevronLeft size={16} />
        </button>
        <strong style={{ fontSize: '1.15rem', minWidth: '120px', textAlign: 'center' }}>
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </strong>
        <button className="btn btn-secondary btn-sm" onClick={() => move(1)} aria-label="다음 달">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="calendar" role="grid">
        {WEEK.map((w, i) => (
          <div key={w} className="calendar-head" style={{ color: i === 0 ? 'var(--danger-text)' : undefined }}>
            {w}
          </div>
        ))}
        {days.map((d) => {
          const key = ymd(d);
          const evs = eventsOn(key);
          const muted = d.getMonth() !== cursor.getMonth();
          return (
            <button
              key={key}
              className={`calendar-cell${muted ? ' muted' : ''}${key === today ? ' today' : ''}${selected === key ? ' selected' : ''}`}
              onClick={() => setSelected(selected === key ? null : key)}
              aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일, 행사 ${evs.length}건`}
            >
              <span className="calendar-day">{d.getDate()}</span>
              {evs.slice(0, 2).map((e) => (
                <span key={e.id} className="calendar-event" title={e.title}>
                  {e.title}
                </span>
              ))}
              {evs.length > 2 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{evs.length - 2}건</span>}
            </button>
          );
        })}
      </div>

      <h4 style={{ margin: '24px 0 12px', fontSize: '1rem' }}>
        {selected ? `${selected.replace(/-/g, '.')} 행사` : `${cursor.getMonth() + 1}월 행사 목록`} ({listed.length}건)
        {selected && (
          <button className="link-btn" style={{ marginLeft: '10px' }} onClick={() => setSelected(null)}>
            이번 달 전체 보기
          </button>
        )}
      </h4>
      {listed.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>등록된 행사가 없습니다. 아래 고용센터 행사 달력도 함께 확인해 주세요.</p>
      ) : (
        <div className="grid" style={{ marginBottom: 0 }}>
          {listed.map((e) => (
            <ProgramCard key={e.id} p={e} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
