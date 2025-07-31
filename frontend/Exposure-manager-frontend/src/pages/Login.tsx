import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Logged in successfully');
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch {
      toast.error('Login failed. Check your credentials.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card-bg)] text-[var(--text-color)] max-w-[400px] mx-auto p-8 rounded-[8px] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
    >
      <h2 className="text-center mb-6 text-[var(--primary-color)]">Login</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full p-3 mb-4 border border-[var(--primary-color)] rounded-[4px] bg-[var(--bg-color)] text-[var(--text-color)] placeholder:text-[#aaa] box-border"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 mb-4 border border-[var(--primary-color)] rounded-[4px] bg-[var(--bg-color)] text-[var(--text-color)] placeholder:text-[#aaa] box-border"
      />

      <button
        type="submit"
        className="w-full p-3 bg-[var(--primary-color)] text-white border-none rounded-[4px] font-bold cursor-pointer hover:opacity-90"
      >
        Log In
      </button>
    </form>
  );
}
