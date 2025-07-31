import { useContext } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import SettingsWrapper from '../components/SettingsWrapper';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsAppearancePage() {
  const { displayType, setDisplayType } = useContext(ThemeContext);

  return (
    <SettingsWrapper>
      <h1 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">
        Appearance Settings
      </h1>

      <div className="bg-[var(--card-bg)] p-6 rounded shadow border border-[var(--primary-color)] w-fit space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Theme</h2>
          <ThemeToggle/>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Table Display Type</h2>
          <select
            value={displayType}
            onChange={(e) => setDisplayType(e.target.value as 'infinite' | 'paginated')}
            className="p-2 border rounded"
          >
            <option value="paginated">Paginated</option>
            <option value="infinite">Infinite Scroll</option>
          </select>
        </div>
      </div>
    </SettingsWrapper>
  );
}
