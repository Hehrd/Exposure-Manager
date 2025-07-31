import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SettingsWrapperProps {
  children: ReactNode;
}

export default function SettingsWrapper({ children }: SettingsWrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-full w-full min-h-[100vh] gap-30">
      {/* Header row for Back button */}
      <div className=" mt-5 ml-5 text-xl">
        <button
          onClick={() => navigate(-1)}
          className=" hover:underline text-[var(--text-color)]"
        >
          ← Back
        </button>
      </div>

      {/* Main settings layout */}
      <div className="flex flex-1 w-full max-h-fit h-fit min-h-fit px-8">
        <aside className="min-w-[200px] h-100% border-r border-[var(--primary-color)] pr-4">
          <h2 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">
            Settings
          </h2>
          <nav className="flex flex-col gap-2">
            <Link
              to="/settings/appearance"
              replace
              className={`hover:underline ${
                isActive('/settings/appearance')
                  ? 'font-bold text-[var(--primary-color)] underline'
                  : 'text-[var(--text-color)]'
              }`}
            >
              Appearance
            </Link>
            <Link
              to="/settings/account"
              replace
              className={`hover:underline ${
                isActive('/settings/account')
                  ? 'font-bold text-[var(--primary-color)] underline'
                  : 'text-[var(--text-color)]'
              }`}
            >
              Account
            </Link>
          </nav>
        </aside>

        <main className=" h-fit flex-1 flex justify-center">
          <div className="flex flex-col w-fit">{children}</div>
        </main>
      </div>
    </div>
  );
}
