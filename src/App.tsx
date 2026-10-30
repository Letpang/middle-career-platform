import { useCallback, useEffect, useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Education from './pages/Education';
import Jobs from './pages/Jobs';
import Counseling from './pages/Counseling';
import Profile from './pages/Profile';
import OrgPortal from './pages/OrgPortal';
import Admin from './pages/Admin';
import CenterPage from './pages/CenterPage';
import ChatWidget from './components/ChatWidget';
import RegionPicker from './components/RegionPicker';
import { fetchCenters, fetchVisit } from './api';
import { centerSlug, matchCenter, regionCenters } from './data/centers';
import { findRegion } from './data/regions';
import { loadHomeRegion, saveHomeRegion } from './lib/region';
import { House as HomeIcon, GraduationCap, Briefcase, User, Link2, MessageCircle, Minus, Plus } from 'lucide-react';

export type Tab = 'home' | 'jobs' | 'education' | 'counseling' | 'profile' | 'org' | 'admin' | 'center';
export type Navigate = (tab: Tab, query?: Record<string, string>) => void;

const PATHS: Record<Tab, string> = {
  home: '/',
  jobs: '/jobs',
  education: '/education',
  counseling: '/counseling',
  profile: '/profile',
  org: '/org',
  admin: '/admin',
  center: '/center', // 실제 주소는 /center/<slug> — navigate('center', { slug })
};

const TITLES: Record<Tab, string> = {
  home: '커리어 브릿지 | 중장년 재취업 지원 플랫폼',
  jobs: '일자리 찾기 | 커리어 브릿지',
  education: '맞춤 교육·훈련 과정 | 커리어 브릿지',
  counseling: '1:1 상담지원 신청 | 커리어 브릿지',
  profile: '내 커리어 프로필 | 커리어 브릿지',
  org: '교육기관 등록 | 커리어 브릿지',
  admin: '센터 관리자 | 커리어 브릿지',
  center: '중장년내일센터 | 커리어 브릿지',
};

const FONT_SIZES = ['16px', '18px', '20px'];

function tabFromPath(pathname: string): Tab {
  if (pathname.startsWith('/center/')) return 'center';
  const hit = (Object.entries(PATHS) as [Tab, string][]).find(([, p]) => p === pathname.replace(/\/+$/, '') || (p === '/' && pathname === '/'));
  return hit ? hit[0] : 'home';
}

const NAV: { tab: Tab; label: string; icon: typeof HomeIcon }[] = [
  { tab: 'home', label: '홈', icon: HomeIcon },
  { tab: 'jobs', label: '일자리', icon: Briefcase },
  { tab: 'education', label: '교육', icon: GraduationCap },
  { tab: 'counseling', label: '상담지원', icon: MessageCircle },
  { tab: 'profile', label: '프로필', icon: User },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => tabFromPath(window.location.pathname));
  // 센터 홈페이지끼리 옮겨 다닐 때 화면을 새로 그리도록 주소를 함께 기억합니다.
  const [pathKey, setPathKey] = useState(() => window.location.pathname);
  const [fontStep, setFontStep] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem('career_bridge_font'));
      return v >= 0 && v <= 2 ? v : 0;
    } catch {
      return 0;
    }
  });
  const [visits, setVisits] = useState<number | null>(null);
  const [region, setRegion] = useState(loadHomeRegion);

  useEffect(() => {
    fetchVisit()
      .then((d) => typeof d.count === 'number' && setVisits(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontStep];
    try {
      localStorage.setItem('career_bridge_font', String(fontStep));
    } catch {
      // ignore
    }
  }, [fontStep]);

  useEffect(() => {
    document.title = TITLES[activeTab] || TITLES.home;
  }, [activeTab]);

  useEffect(() => {
    const onPop = () => {
      setActiveTab(tabFromPath(window.location.pathname));
      setPathKey(window.location.pathname);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback<Navigate>((tab, query) => {
    setActiveTab(tab);
    const { slug, ...rest } = query || {};
    const qs = Object.keys(rest).length ? `?${new URLSearchParams(rest)}` : '';
    const path = tab === 'center' && slug ? `${PATHS.center}/${encodeURIComponent(slug)}` : PATHS[tab] || '/';
    const target = path + qs;
    setPathKey(path);
    if (window.location.protocol !== 'file:' && window.location.pathname + window.location.search !== target) {
      try {
        window.history.pushState(null, '', target);
      } catch {
        // ignore
      }
    }
    window.scrollTo(0, 0);
  }, []);

  // 센터 홈페이지를 보는 중에 지역을 바꾸면 그 지역 센터 홈페이지로 바로 옮깁니다.
  const changeRegion = useCallback(
    (key: string) => {
      const r = findRegion(key);
      if (!r) return;
      setRegion(r);
      saveHomeRegion(r.key);
      const center = activeTab === 'center' ? regionCenters(r)[0] : undefined;
      if (!center) return;
      fetchCenters()
        .then((d) => d.items.find((p) => matchCenter(p.name) === center)?.slug)
        .catch(() => undefined)
        .then((slug) => navigate('center', { slug: slug || centerSlug(center) }));
    },
    [activeTab, navigate],
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return <Education navigate={navigate} />;
      case 'jobs':
        return <Jobs navigate={navigate} />;
      case 'counseling':
        return <Counseling navigate={navigate} />;
      case 'profile':
        return <Profile navigate={navigate} />;
      case 'org':
        return <OrgPortal />;
      case 'admin':
        return <Admin />;
      case 'center':
        return <CenterPage key={pathKey} navigate={navigate} />;
      default:
        return <Home key={region.key} navigate={navigate} region={region} />;
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('home')}>
            <Link2 className="logo-icon" />
            <span>커리어 브릿지</span>
          </div>

          <div className="nav-links">
            {NAV.map(({ tab, label, icon: Icon }) => (
              <button key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => navigate(tab)}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="navbar-tools">
            <RegionPicker region={region} onChange={changeRegion} />

            <div className="font-size-control" role="group" aria-label="글자 크기 조절">
              <button className="font-size-btn" onClick={() => setFontStep((s) => Math.max(0, s - 1))} disabled={fontStep === 0} aria-label="글자 작게">
                <Minus size={14} />
              </button>
              <span className="font-size-label">가</span>
              <button className="font-size-btn" onClick={() => setFontStep((s) => Math.min(2, s + 1))} disabled={fontStep === 2} aria-label="글자 크게">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>{renderContent()}</main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logo">커리어 브릿지 (Career Bridge)</div>
          <p style={{ marginBottom: '10px', fontSize: '0.85rem' }}>인생 2막, 새로운 시작과 도전을 위한 중장년 전문 커리어 매칭 시스템</p>
          <p style={{ fontSize: '0.75rem', marginBottom: '4px' }}>직업정보제공사업자 신고번호: J1802020260007</p>
          <p style={{ fontSize: '0.75rem' }}>© {new Date().getFullYear()} Career Bridge. All rights reserved.</p>
          {visits !== null && <p style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.8 }}>누적 방문자 수: {visits.toLocaleString()}명</p>}
          <div className="footer-links">
            <button onClick={() => navigate('org')}>교육기관·센터 등록·로그인</button>
            <button onClick={() => navigate('admin')}>센터 관리자</button>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </>
  );
}

export default App;
