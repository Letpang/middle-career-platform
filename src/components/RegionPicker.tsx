import { useEffect, useRef, useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { SIDO, type Region } from '../data/regions';

// 상단 메뉴의 "우리 지역" 설정. 시·도 → 시·군·구를 고르면 바로 바뀝니다.
const RegionPicker = ({ region, onChange }: { region: Region; onChange: (key: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [sidoName, setSidoName] = useState(region.sido.name);
  const box = useRef<HTMLDivElement>(null);
  const sido = SIDO.find((s) => s.name === sidoName) || region.sido;

  useEffect(() => {
    if (!open) return;
    setSidoName(region.sido.name);
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, region]);

  return (
    <div className="region-picker" ref={box}>
      <button className="region-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`우리 지역: ${region.key}. 바꾸기`}>
        <MapPin size={16} />
        <span>{region.name}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="region-pop">
          <p className="region-pop-title">우리 지역 설정</p>
          <p className="region-pop-desc">홈의 일자리와 중장년내일센터가 이 지역으로 바뀌어요.</p>
          <select value={sidoName} onChange={(e) => setSidoName(e.target.value)} aria-label="시·도">
            {SIDO.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="region-areas">
            {sido.areas.map(([, name]) => {
              const key = `${sido.name} ${name}`;
              return (
                <button
                  key={key}
                  className={`filter-btn ${key === region.key ? 'active' : ''}`}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionPicker;
