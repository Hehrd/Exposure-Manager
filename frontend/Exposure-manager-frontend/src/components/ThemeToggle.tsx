import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="w-full text-left text-sm flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary-color)] text-[var(--text-color)] hover:opacity-90 transition-all"
    >
      {theme === 'light' ? ' Dark Mode' : ' Light Mode'}
    </button>
  );
}
