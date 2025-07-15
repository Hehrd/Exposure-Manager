import ThemeToggle from '../components/ThemeToggle';
import SettingsWrapper from '../components/SettingsWrapper';

export default function SettingsAppearancePage() {
  return (
    <SettingsWrapper>
      <h1 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">Appearance Settings</h1>
      <div className="bg-[var(--card-bg)] p-6 rounded shadow border border-[var(--primary-color)] w-fit">
        <ThemeToggle />
      </div>
    </SettingsWrapper>
  );
}
