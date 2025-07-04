import { ReactNode, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Wrapper.css';
import ThemeToggle from './ThemeToggle';
import LogoutButton from './LogoutButton';

interface WrapperProps {
  children: ReactNode;
}

const parseBreadcrumb = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.join(' > ');
};

export default function AppWrapper({ children }: WrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = parseBreadcrumb(location.pathname);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileIconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        profileIconRef.current &&
        !profileIconRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="wrapper-container">
      <header className="wrapper-header">
        <div
          className="logo"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
        >
          <b>
            <span>Exposure</span><br />
            <span>Manager</span>
          </b>
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search" disabled />
        </div>
        <div className="header-icons">
          <span
            className="icon profile-icon"
            ref={profileIconRef}
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            👤
          </span>
          {profileOpen && (
            <div className="profile-dropdown" ref={profileRef}>
              <ThemeToggle />
              <LogoutButton />
            </div>
          )}
        </div>
      </header>

      <div className="breadcrumb">
        {currentPath || 'Home'}
      </div>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
