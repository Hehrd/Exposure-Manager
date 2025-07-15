import ThemeToggle from '../components/ThemeToggle';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">Settings</h1>
      <div className="bg-[var(--card-bg)] p-6 rounded shadow border border-[var(--primary-color)] w-fit">
        <ThemeToggle />
      </div>
    </div>
  );
}
