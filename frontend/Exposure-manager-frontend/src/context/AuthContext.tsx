// 📁 src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.username);
    } catch {
      setUser(null);
    }
  };

  // ✅ On first load
  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Login: only check status, then fetch from /me
  const login = async (username: string, password: string) => {
    const body = {
      username,
      password,
      role: 'ADMIN',
    };

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Invalid credentials');

    await fetchUser(); // trust /me as source of truth
  };

  // ✅ Logout clears backend + frontend
  const logout = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
