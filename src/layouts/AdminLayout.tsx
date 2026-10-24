import { NavLink, Outlet } from 'react-router-dom';

export function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-white/15 font-bold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`;
  return <div className="min-h-screen bg-[#F4FAFA] md:flex">
    <aside className="bg-ink p-4 text-white md:min-h-screen md:w-[220px] md:shrink-0 md:px-5 md:py-6">
      <p className="mb-4 font-heading text-xl font-extrabold">◉ LaundryKu</p>
      <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto md:flex-col">
        <NavLink end to="/admin" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/admin/pesanan" className={linkClass}>Pesanan</NavLink>
        <NavLink to="/admin/harga" className={linkClass}>Pengaturan Harga</NavLink>
      </nav>
    </aside>
    <main className="min-w-0 flex-1 p-4 md:px-8 md:py-7"><Outlet /></main>
  </div>;
}
