import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { formatRupiah } from '../../lib/pricing';
import { useAuth } from '../../services/AuthContext';
import { ordersService } from '../../services/orders';
import type { Order, OrderStatus } from '../../types';
import '../../lib/leaflet';

const timeline: { status: OrderStatus; title: string; description: string }[] = [
  { status: 'menunggu_konfirmasi', title: 'Menunggu Konfirmasi', description: 'Pesanan diterima' },
  { status: 'dikonfirmasi', title: 'Dikonfirmasi', description: 'Menunggu konfirmasi laundry' },
  { status: 'dijemput', title: 'Dijemput', description: 'Kurir mengambil cucian' },
  { status: 'diproses', title: 'Diproses', description: 'Dicuci dan dirapikan' },
  { status: 'selesai', title: 'Selesai', description: 'Siap diantar kembali' },
];
const speedLabels = { reguler: 'Reguler', express: 'Express', kilat: 'Kilat' };
const serviceLabels = { cuci_kering_lipat: 'Cuci Kering Lipat', cuci_setrika: 'Cuci + Setrika', setrika_saja: 'Setrika Saja' };

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadOrder = useCallback(async () => {
    if (!user) { setOrder(null); setLoading(false); return; }
    setError('');
    try {
      const foundOrder = await ordersService.getById(id);
      setOrder(foundOrder?.customerId === user.id ? foundOrder : null);
    } catch { setError('Detail pesanan gagal dimuat. Silakan coba lagi.'); }
    finally { setLoading(false); }
  }, [id, user]);
  useEffect(() => {
    setLoading(true);
    void loadOrder();
    window.addEventListener('storage', loadOrder);
    return () => window.removeEventListener('storage', loadOrder);
  }, [loadOrder]);

  if (loading) return <main className="mx-auto max-w-2xl px-4 py-8"><p role="status" className="text-sm text-muted">Memuat detail pesanan...</p></main>;
  if (error) return <main className="mx-auto max-w-2xl px-4 py-8"><p role="alert" className="rounded-token bg-red-50 p-4 text-sm text-red-700">{error}</p></main>;
  if (!order) return <main className="mx-auto max-w-2xl px-4 py-8"><Card><h1 className="font-heading text-xl font-bold text-ink">Pesanan tidak ditemukan</h1><p className="mt-2 text-sm text-muted">Pesanan ini tidak tersedia untuk akun Anda.</p><Link to="/pesanan" className="mt-4 inline-block text-sm font-bold text-ocean">Kembali ke pesanan saya</Link></Card></main>;

  const currentIndex = timeline.findIndex((item) => item.status === order.status);
  const isRejected = order.status === 'ditolak';
  const completedIndex = isRejected ? -1 : currentIndex;

  return <main className="mx-auto max-w-2xl space-y-4 px-4 py-7">
    <header><p className="font-mono text-xs text-muted">{order.id} · Dibuat {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p><h1 className="mt-2 font-heading text-2xl font-extrabold text-ink">Detail pesanan</h1><div className="mt-3"><Badge status={order.status} /></div></header>
    {isRejected ? <Card className="border-red-200 bg-red-50"><h2 className="font-semibold text-red-800">Pesanan ditolak</h2><p className="mt-2 text-sm text-red-700">{order.rejectionReason || 'Pesanan belum dapat diproses.'}</p></Card> : <Card><h2 className="mb-4 font-heading font-bold text-ink">Status pesanan</h2><ol className="space-y-0">{timeline.map((item, index) => {
      const isCurrent = index === currentIndex;
      const isDone = index <= completedIndex;
      return <li key={item.status} className="relative flex gap-3 pb-5 last:pb-0"><span className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-white ${isDone ? 'bg-ocean' : 'bg-line'}`}></span>{index < timeline.length - 1 && <span className={`absolute left-[5px] top-4 h-full w-0.5 ${index < completedIndex ? 'bg-ocean' : 'bg-line'}`}></span>}<div className="-mt-0.5"><p className={`text-sm ${isCurrent ? 'font-bold text-ocean' : isDone ? 'font-semibold text-ink' : 'text-muted'}`}>{item.title}{isCurrent && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide">Saat ini</span>}</p><p className="mt-1 text-xs text-muted">{item.description}{index === 0 ? ` · ${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}</p></div></li>;
    })}</ol></Card>}
    <Card><h2 className="font-heading font-bold text-ink">Rincian harga</h2><div className="mt-3 space-y-2 text-sm"><p className="text-muted">{speedLabels[order.speed]} · {serviceLabels[order.service]} · {order.weightKg} kg</p><div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div><div className="flex justify-between"><span className="text-muted">Biaya jemput</span><span>{order.pickupFee ? formatRupiah(order.pickupFee) : 'Gratis'}</span></div><div className="flex justify-between border-t border-line pt-2 font-bold"><span>Total</span><span>{formatRupiah(order.total)}</span></div>{order.notes && <p className="border-t border-line pt-2 text-muted"><strong className="text-ink">Catatan:</strong> {order.notes}</p>}</div></Card>
    <section><h2 className="mb-2 font-heading font-bold text-ink">Titik jemput</h2><div className="h-40 overflow-hidden rounded-token border border-line shadow-soft"><MapContainer center={[order.pickupLocation.lat, order.pickupLocation.lng]} zoom={15} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false} className="h-full w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={[order.pickupLocation.lat, order.pickupLocation.lng]} /></MapContainer></div><p className="mt-2 text-xs text-muted">{order.pickupAddress}</p></section>
  </main>;
}
