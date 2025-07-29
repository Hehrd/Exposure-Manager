import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface AuthContextType {
  user: string | null;
  role: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        setRole(null);
      } else {
        const data: { username: string; role: string } = await res.json();
        setUser(data.username);
        setRole(data.role);
      }
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Invalid credentials');
    }

    const data: { username: string; role: string } = await res.json();
    setUser(data.username);
    setRole(data.role);
    setLoading(false);
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
