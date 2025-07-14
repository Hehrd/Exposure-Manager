import SettingsWrapper from '../components/SettingsWrapper';

export default function SettingsAccountPage() {
  const mockUser = {
    username: 'demo_user',
    email: 'user@example.com',
  };

  return (
    <SettingsWrapper>
      <h1 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">Account Settings</h1>
      <div className="bg-[var(--card-bg)] p-6 rounded shadow border border-[var(--primary-color)] w-fit">
        <p className="mb-2"><strong>Username:</strong> {mockUser.username}</p>
        <p><strong>Email:</strong> {mockUser.email}</p>
      </div>
    </SettingsWrapper>
  );
}
