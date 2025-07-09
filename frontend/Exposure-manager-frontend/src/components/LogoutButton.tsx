import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import icon from '../assets/user_interface_exit_door_icon_191677.png'

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary-color)] text-[var(--text-color)] hover:opacity-90 transition-all"
    >
     <span>Log out</span>
      <span>
        <img src={icon} alt="logout icon" className="w-5 h-5" />
      </span>
    </button>
  );
}
