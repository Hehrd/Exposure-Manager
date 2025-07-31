import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import gearIcon from '../assets/gear.svg'
interface WrapperProps {
  children: ReactNode;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const generateBreadcrumbLinks = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2) {
    return [
      <Link
        key="home"
        to="/"
        className="text-[var(--primary-color)] hover:underline underline-offset-2 transition-all"
      >
        Home
      </Link>,
    ];
  }

  const [_, databaseName, __, portfolioName, portfolioId, ___, accountName, accountId, type, name, id] = segments;

  const crumbs = [
    {
      label: capitalize(decodeURIComponent(databaseName)),
      to: `/databases/${databaseName}`,
    },
  ];

  if (portfolioName && portfolioId) {
    crumbs.push({
      label: capitalize(decodeURIComponent(portfolioName)),
      to: `/databases/${databaseName}/portfolios/${portfolioName}/${portfolioId}`,
    });
  }

  if (accountName && accountId) {
    crumbs.push({
      label: capitalize(decodeURIComponent(accountName)),
      to: `/databases/${databaseName}/portfolios/${portfolioName}/${portfolioId}/accounts/${accountName}/${accountId}`,
    });
  }

  if (type && (type === "locations" || type === "policies") && name && id) {
    crumbs.push({
      label: capitalize(decodeURIComponent(name)),
      to: `/databases/${databaseName}/portfolios/${portfolioName}/${portfolioId}/accounts/${accountName}/${accountId}/${type}/${name}/${id}`,
    });
  }

  return [
    <Link
      key="home"
      to="/"
      className="text-[var(--primary-color)] hover:underline underline-offset-2 transition-all"
    >
      Home
    </Link>,
    ...crumbs.map((crumb, index) => (
      <span key={index}>
        <span className="mx-1">{">"}</span>
        <Link
          to={crumb.to}
          className="text-[var(--primary-color)] hover:underline underline-offset-2 transition-all"
        >
          {crumb.label}
        </Link>
      </span>
    )),
  ];
};





export default function AppWrapper({ children }: WrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();

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
        <Link
          to="/"
          className="font-bold bg-[var(--primary-color)] text-[var(--text-color)] px-4 py-2 rounded cursor-pointer"
        >
          <b>
            <span>Exposure</span><br />
            <span>Manager</span>
          </b>
        </Link>

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
              {/* inside your profile dropdown */}
            <button
              onClick={() => {
                setProfileOpen(false);
                navigate('/settings/account');
              }}
              className="w-full text-left text-sm flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary-color)] text-[var(--text-color)] hover:opacity-90 transition-all"
            >
              <img src={gearIcon} alt="Settings" className="w-4 h-4" />
              Settings
            </button>

            <button
              onClick={() => {
                setProfileOpen(false);
                navigate('/jobs');
              }}
              className="w-full text-left text-sm flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary-color)] text-[var(--text-color)] hover:opacity-90 transition-all"
            >
              {/* replace with your Jobs icon if you have one */}
              <span className="w-4 h-4 inline-block" />
              Jobs
            </button>

            <hr className="border-[var(--primary-color)]" />

            <LogoutButton />

            </div>
          )}

        </div>
      </header>

      <div className="bg-[var(--card-bg)] text-[var(--text-color)] px-8 py-3 text-[0.95rem] font-medium border-b border-[var(--primary-color)]">
        {generateBreadcrumbLinks(location.pathname) || 'Home'}
      </div>

      <main className="p-8 flex-grow h-fit min-h-0">
        {children}
      </main>
    </div>
  );
}
