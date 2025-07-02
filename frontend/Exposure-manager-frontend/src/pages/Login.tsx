import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if(!username) return;
    login(username);
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Login Page</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
