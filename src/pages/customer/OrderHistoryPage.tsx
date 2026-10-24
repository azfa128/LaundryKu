import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { formatRupiah } from '../../lib/pricing';
import { useAuth } from '../../services/AuthContext';
import { ordersService } from '../../services/orders';
import type { Order } from '../../types';

const speedLabels = { reguler: 'Reguler', express: 'Express', kilat: 'Kilat' };

export function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadOrders = useCallback(async () => {
    if (!user) { setOrders([]); setLoading(false); return; }
    setError('');
    try { setOrders(await ordersService.getForCustomer(user.id)); }
    catch { setError('Riwayat pesanan gagal dimuat. Silakan muat ulang halaman.'); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => {
    void loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, [loadOrders]);

  return <main className="mx-auto max-w-2xl px-4 py-7">
    <p className="text-xs font-bold uppercase tracking-wider text-ocean">Pesanan pelanggan</p><h1 className="mt-2 font-heading text-2xl font-extrabold text-ink">Pesanan saya</h1><p className="mt-1 text-sm text-muted">Pantau status laundry dan riwayat pembayaran.</p>
    {error && <p role="alert" className="mt-5 rounded-token bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p role="status" className="mt-6 text-sm text-muted">Memuat riwayat pesanan...</p> : orders.length === 0 ? <Card className="mt-6 text-center"><h2 className="font-heading text-lg font-bold text-ink">Belum ada pesanan</h2><p className="mt-2 text-sm text-muted">Pesanan laundry Anda akan muncul di halaman ini.</p><Link to="/pesan" className="mt-4 inline-block text-sm font-bold text-ocean transition hover:underline decoration-teal decoration-2 underline-offset-4">Buat pesanan pertama →</Link></Card> : <section aria-label="Daftar pesanan" className="mt-5 space-y-3">{orders.map((order) => <Card key={order.id} className="p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-ocean">{order.id}</p><h2 className="mt-2 font-heading font-bold text-ink">{speedLabels[order.speed]} · {order.weightKg} kg</h2><p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><Badge status={order.status} /></div><div className="mt-4 flex items-center justify-between border-t border-line pt-3"><span className="text-sm text-muted">Total</span><strong className="font-mono text-sm text-ink">{formatRupiah(order.total)}</strong></div><Link to={`/pesanan/${order.id}`} className="mt-3 inline-block text-sm font-bold text-ocean transition hover:underline decoration-teal decoration-2 underline-offset-4">Lihat detail →</Link></Card>)}</section>}
  </main>;
}
