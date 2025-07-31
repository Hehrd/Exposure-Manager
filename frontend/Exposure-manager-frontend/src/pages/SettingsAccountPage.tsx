import SettingsWrapper from '../components/SettingsWrapper';
import { useAuth } from '../context/AuthContext';

export default function SettingsAccountPage() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <SettingsWrapper>
        <p className="text-center py-6">Loading account info…</p>
      </SettingsWrapper>
    );
  }

  return (
    <SettingsWrapper>
      <h1 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">
        Account Settings
      </h1>
      <div className="bg-[var(--card-bg)] p-6 rounded shadow border border-[var(--primary-color)] w-fit">
        <p className="mb-2">
          <strong>Username:</strong> {user}
        </p>
        <p>
          <strong>Role:</strong> {role}
        </p>
      </div>
    </SettingsWrapper>
  );
}
