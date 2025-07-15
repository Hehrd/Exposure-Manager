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

  // ✅ Check for cookie/session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:6969/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.username); // Backend returns { username: "..." }
      } catch {
        setUser(null);
      }
    };

    checkSession();
  }, []);

  // Login: send credentials, cookie is set server-side
  const login = async (username: string, password: string) => {
    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    const res = await fetch('http://localhost:6969/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Invalid credentials');

    const data = await res.json();
    setUser(data.username); // Trust backend response
  };

  // Logout: server clears cookie, frontend clears context
  const logout = async () => {
    await fetch('http://localhost:6969/logout', {
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
