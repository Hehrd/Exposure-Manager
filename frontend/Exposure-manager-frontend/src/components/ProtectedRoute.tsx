import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const timeout = setTimeout(() => {
        toast.warning('Please log in to see this page');
        setShouldRedirect(true);
      }, 10);

      return () => clearTimeout(timeout);
    }
  }, [loading, user]);

  if (loading) return null; // or loading spinner/skeleton
  if (!user && shouldRedirect) return <Navigate to="/login" />;
  if (!user) return null;

  return children;
}
