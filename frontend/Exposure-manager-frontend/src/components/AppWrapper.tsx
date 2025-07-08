import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    <div className="bg-[var(--bg-color)] text-[var(--text-color)] min-h-screen flex flex-col w-full">
      
      <header className="flex items-center justify-between bg-[var(--secondary-color)] px-8 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <div
          className="font-bold bg-[var(--primary-color)] text-white px-4 py-2 rounded cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        >
          <b>
            <span>Exposure</span><br />
            <span>Manager</span>
          </b>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-[var(--bg-color)] border border-[var(--primary-color)] px-2 py-1 rounded w-[300px]">
          <span className="text-[var(--primary-color)] mr-2 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search"
            disabled
            className="bg-transparent text-[var(--text-color)] w-full outline-none border-none"
          />
        </div>

      
        <div className="relative flex items-center gap-4 text-[1.3rem]">
          <span
            className="cursor-pointer"
            ref={profileIconRef}
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            👤
          </span>

          {profileOpen && (
            <div
              ref={profileRef}
              className="absolute top-[120%] right-0 w-[220px] min-h-[120px] bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--primary-color)] rounded-lg p-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)] z-[1000] flex flex-col gap-3"
            >
              <ThemeToggle />
              <LogoutButton />
            </div>
          )}
        </div>
      </header>

     
      <div className="bg-[var(--card-bg)] text-[var(--text-color)] px-8 py-3 text-[0.95rem] font-medium border-b border-[var(--primary-color)]">
        {currentPath || 'Home'}
      </div>

      <main className="p-8 flex-grow h-fit min-h-0">
        {children}
      </main>
    </div>
  );
}
