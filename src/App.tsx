import { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Education from './pages/Education';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import { Home as HomeIcon, GraduationCap, Briefcase, User, Link2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'education':
        return <Education />;
      case 'jobs':
        return <Jobs />;
      case 'profile':
        return <Profile />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <Link2 className="logo-icon" />
            <span>커리어 브릿지</span>
          </div>
          
          <div className="nav-links">
            <button 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <HomeIcon size={18} />
              <span>홈</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <GraduationCap size={18} />
              <span>교육</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <Briefcase size={18} />
              <span>일자리</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>프로필</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logo">커리어 브릿지 (Career Bridge)</div>
          <p style={{ marginBottom: '10px', fontSize: '0.85rem' }}>인생 2막, 새로운 시작과 도전을 위한 중장년 전문 커리어 매칭 시스템</p>
          <p style={{ fontSize: '0.75rem' }}>© {new Date().getFullYear()} Career Bridge. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
