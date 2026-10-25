import { useEffect, useState } from 'react';
import type { VisitStats } from '../api';

type Metric = 'visitors' | 'visits';
const METRIC_LABEL: Record<Metric, string> = { visitors: '방문자', visits: '방문 횟수' };
const CHART_DAYS = 30;

// today(YYYY-MM-DD)에서 n일 전 날짜
function shift(day: string, n: number) {
  return new Date(Date.parse(day + 'T00:00:00Z') - n * 86400_000).toISOString().slice(0, 10);
}

function shortDay(day: string) {
  const [, m, d] = day.split('-');
  return `${Number(m)}/${Number(d)}`;
}

function niceMax(v: number) {
  if (v <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * step >= v) return k * step;
  return 10 * step;
}

const VisitStatsPanel = ({ stats }: { stats: VisitStats }) => {
  const [metric, setMetric] = useState<Metric>('visitors');
  const [hover, setHover] = useState<number | null>(null);
  // 좁은 화면에서는 좌표 폭을 줄여 글자·막대가 작아지지 않게 합니다.
  const [narrow, setNarrow] = useState(() => window.innerWidth < 600);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const byDay = new Map(stats.days.map((d) => [d.day, d]));
  const get = (day: string) => byDay.get(day) ?? { day, visits: 0, visitors: 0 };
  const sum = (from: number, to: number, key: Metric) => {
    let t = 0;
    for (let i = from; i <= to; i++) t += get(shift(stats.today, i))[key];
    return t;
  };

  const tiles = [
    { label: '오늘', from: 0, to: 0 },
    { label: '어제', from: 1, to: 1 },
    { label: '최근 7일', from: 0, to: 6 },
    { label: '최근 30일', from: 0, to: 29 },
  ];

  const series = Array.from({ length: CHART_DAYS }, (_, i) => get(shift(stats.today, CHART_DAYS - 1 - i)));
  const max = niceMax(Math.max(...series.map((d) => d[metric]), 1));
  const ticks = [0, max / 2, max];

  // 차트 좌표 (viewBox 기준)
  const W = narrow ? 340 : 720;
  const H = narrow ? 220 : 240;
  const padL = 36;
  const padB = 28;
  const padT = 12;
  const plotW = W - padL - 8;
  const plotH = H - padT - padB;
  const slot = plotW / CHART_DAYS;
  const barW = slot - (narrow ? 1 : 2);
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  const firstDay = stats.days[0]?.day;
  const hovered = hover !== null ? series[hover] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="visit-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="panel visit-tile">
            <div className="visit-tile-label">{t.label}</div>
            <div className="visit-tile-value">{sum(t.from, t.to, 'visitors').toLocaleString()}명</div>
            <div className="visit-tile-sub">방문 {sum(t.from, t.to, 'visits').toLocaleString()}회</div>
          </div>
        ))}
        <div className="panel visit-tile">
          <div className="visit-tile-label">누적 방문</div>
          <div className="visit-tile-value">{Number(stats.total).toLocaleString()}회</div>
          <div className="visit-tile-sub">사이트 하단 표시 숫자</div>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>최근 30일 {METRIC_LABEL[metric]}</h2>
          <div className="filter-row">
            {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
              <button key={m} className={`filter-btn ${metric === m ? 'active' : ''}`} onClick={() => setMetric(m)}>
                {METRIC_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`최근 30일 날짜별 ${METRIC_LABEL[metric]} 막대 그래프`} onMouseLeave={() => setHover(null)}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} stroke="var(--border-color)" strokeWidth={1} />
                <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
                  {t.toLocaleString()}
                </text>
              </g>
            ))}
            {series.map((d, i) => {
              const v = d[metric];
              const x = padL + i * slot + 1;
              const top = y(v);
              const h = padT + plotH - top;
              const r = Math.min(4, h, barW / 2);
              return (
                <g key={d.day} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
                  {/* 마우스 감지 영역은 막대보다 넓게 */}
                  <rect x={padL + i * slot} y={padT} width={slot} height={plotH} fill="transparent" />
                  {v > 0 && (
                    <path
                      d={`M${x},${padT + plotH} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${padT + plotH} Z`}
                      fill="var(--primary)"
                      opacity={hover === null || hover === i ? 1 : 0.45}
                    />
                  )}
                  {(i % 7 === CHART_DAYS % 7 - 1 || i === CHART_DAYS - 1) && (
                    <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
                      {i === CHART_DAYS - 1 ? '오늘' : shortDay(d.day)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {hovered && hover !== null && (
            <div
              className="visit-tooltip"
              style={{ left: `${((padL + (hover + 0.5) * slot) / W) * 100}%`, transform: hover > CHART_DAYS / 2 ? 'translateX(-100%)' : 'none' }}
            >
              <strong>{hovered.day}</strong>
              <div>방문자 {hovered.visitors.toLocaleString()}명</div>
              <div>방문 {hovered.visits.toLocaleString()}회</div>
            </div>
          )}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          방문자는 기기 기준으로 하루 한 번만 셉니다. 방문 횟수는 사이트를 열 때마다 셉니다.
          {firstDay ? ` 날짜별 기록은 ${firstDay}부터 있습니다.` : ' 날짜별 기록은 이 기능을 배포한 날부터 쌓입니다.'}
        </p>
      </div>

      <details className="panel" style={{ padding: '16px 20px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>날짜별 표로 보기</summary>
        <div className="table-wrap" style={{ marginTop: '10px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>방문자</th>
                <th>방문 횟수</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((d) => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td>{d.visitors.toLocaleString()}</td>
                  <td>{d.visits.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export default VisitStatsPanel;
