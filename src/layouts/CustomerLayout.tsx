import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Button } from '../components/Button';

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function signOut() { await logout(); navigate('/', { replace: true }); }
  return <div className="min-h-screen bg-ground"><header className="border-b border-line bg-card shadow-soft"><nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3"><Link to="/" className="shrink-0 font-heading text-xl font-extrabold text-ocean">◉ LaundryKu</Link><div className="flex items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">{user ? <><Link to="/pesanan" className="text-ink transition hover:text-ocean">Pesanan</Link><span className="max-w-28 truncate text-muted sm:max-w-none">{user.name}</span><Button variant="outline" className="px-3 py-2 text-xs" onClick={() => void signOut()}>Keluar</Button></> : <Link to="/login" className="text-ocean transition hover:text-ink">Masuk</Link>}</div></nav></header><Outlet /></div>;
}
