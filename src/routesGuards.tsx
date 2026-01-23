import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function RequireRole({ children, role }: { children: ReactNode; role: 'academic' | 'student' }) {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role !== role) return <Navigate to="/login" replace />;
  return children;
}


