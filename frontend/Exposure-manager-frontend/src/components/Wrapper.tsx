import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Wrapper.css';

interface WrapperProps {
  children: ReactNode;
}

const parseBreadcrumb = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.join(' > ');
};

export default function AppWrapper({ children }: WrapperProps) {
  const location = useLocation();
  const currentPath = parseBreadcrumb(location.pathname);

  return (
    <div className="wrapper-container">
      <header className="wrapper-header">
        <div className="logo"><b><span>Exposure</span><br/><span>Manager</span></b></div>
        <div className="search-bar">
            <input type="text" placeholder="Search" disabled />
            <span className="search-icon">🔍</span>
        </div>
        <div className="header-icons">
          <span className="icon">👤</span>
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
