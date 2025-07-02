import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
  justLoggedOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  justLoggedOut: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  const login = (username: string) => {
    setUser(username);
    setJustLoggedOut(false);
  };

  const logout = () => {
    setUser(null);
    setJustLoggedOut(true);
    toast.info("You've been logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, justLoggedOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
