import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    const res = await fetch('http://localhost:6969/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      credentials: 'include',
    });

    if (res.ok) {
      toast.success('Account created! Redirecting...');
      navigate('/login');
    } else {
      toast.error('Signup failed. Try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card-bg)] text-[var(--text-color)] max-w-[400px] mx-auto p-8 rounded-[8px] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
    >
      <h2 className="text-center mb-6 text-[var(--primary-color)]">Sign Up</h2>

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

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="w-full p-3 mb-4 border border-[var(--primary-color)] rounded-[4px] bg-[var(--bg-color)] text-[var(--text-color)] placeholder:text-[#aaa] box-border"
      />

      <button
        type="submit"
        className="w-full p-3 bg-[var(--primary-color)] text-white border-none rounded-[4px] font-bold cursor-pointer hover:opacity-90"
      >
        Sign Up
      </button>
    </form>
  );
}
