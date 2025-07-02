// 📁 src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, justLoggedOut } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!user && !justLoggedOut) {
      toast.warning('Please log in to see this page');
      const timeout = setTimeout(() => setShouldRedirect(true), 10);
      return () => clearTimeout(timeout);
    }

    if (!user && justLoggedOut) {
      setShouldRedirect(true);
    }
  }, [user, justLoggedOut]);

  if (!user && shouldRedirect) return <Navigate to="/login" />;
  if (!user) return null;

  return children;
}
