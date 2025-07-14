import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SettingsWrapperProps {
  children: ReactNode;
}

export default function SettingsWrapper({ children }: SettingsWrapperProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-full w-full p-8">
      <aside className="min-w-[200px] border-r border-[var(--primary-color)] pr-4">
        <h2 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">Settings</h2>
        <nav className="flex flex-col gap-2">
        <Link
            to="/settings/appearance"
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

      <main className="flex-1 flex justify-center">
        <div className='flex flex-col w-fit'>{children}</div>
      </main>
    </div>
  );
}
