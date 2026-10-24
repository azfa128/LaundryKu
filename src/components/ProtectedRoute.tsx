import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../types';
import { useAuth } from '../services/AuthContext';

export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <main className="p-8 text-center text-muted">Memuat sesi...</main>;
  if (error && !user) return <main role="alert" className="mx-auto max-w-xl p-8 text-center text-sm text-red-700">{error}</main>;
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace state={{ from: location }} />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
}
