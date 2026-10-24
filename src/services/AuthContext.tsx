import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { authService, type AuthCredentials, type RegisterDetails } from './auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string;
  login: (credentials: AuthCredentials) => Promise<User>;
  register: (details: RegisterDetails) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const unsubscribe = authService.onAuthStateChange((nextUser, authError) => {
      if (!active) return;
      setUser(nextUser);
      setError(authError?.message ?? '');
      setLoading(false);
    });
    void authService.getCurrentUser().then((currentUser) => {
      if (active) { setUser(currentUser); setError(''); }
    }).catch((cause: unknown) => {
      if (active) { setUser(null); setError(cause instanceof Error ? cause.message : 'Sesi gagal diperiksa.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; unsubscribe(); };
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user, loading, error,
    async login(credentials) { setError(''); const nextUser = await authService.login(credentials); setUser(nextUser); return nextUser; },
    async register(details) { setError(''); const nextUser = await authService.register(details); setUser(nextUser); return nextUser; },
    async logout() { await authService.logout(); setUser(null); setError(''); },
  }), [user, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
