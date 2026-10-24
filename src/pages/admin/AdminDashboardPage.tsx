import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { formatRupiah } from '../../lib/pricing';
import { ordersService } from '../../services/orders';
import type { Order } from '../../types';

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void ordersService.getAll().then(setOrders).catch(() => setError('Data pesanan belum dapat dimuat.')).finally(() => setLoading(false)); }, []);
  const newOrders = orders.filter((order) => order.status === 'menunggu_konfirmasi').length;
  const inProgress = orders.filter((order) => ['dikonfirmasi', 'dijemput', 'diproses'].includes(order.status)).length;
  const completed = orders.filter((order) => order.status === 'selesai');
  const revenue = completed.reduce((total, order) => total + order.total, 0);
  const recent = orders.slice(0, 5);

  return <div className="mx-auto max-w-[1060px] space-y-7">
    <header><p className="text-xs font-bold uppercase tracking-wider text-ocean">Overview</p><h1 className="mt-2 font-heading text-2xl font-extrabold text-ink">Dashboard operasional</h1><p className="mt-1 text-sm text-muted">Ringkasan layanan LaundryKu.</p></header>
    {error && <p role="alert" className="rounded-token bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p role="status" className="text-sm text-muted">Memuat ringkasan pesanan...</p> : <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[newOrders, 'Pesanan baru', 'Perlu dikonfirmasi'], [inProgress, 'Diproses', 'Dalam penanganan'], [completed.length, 'Selesai', 'Pesanan tuntas'], [formatRupiah(revenue), 'Pendapatan', 'Dari pesanan selesai']].map(([value, label, caption]) => <Card key={label} className="p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 font-heading text-xl font-extrabold text-ink">{value}</p><p className="mt-1 text-xs text-muted">{caption}</p></Card>)}
      </section>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="font-heading text-lg font-bold text-ink">Pesanan terbaru</h2><Link to="/admin/pesanan" className="text-sm font-semibold text-ocean transition hover:underline decoration-teal decoration-2 underline-offset-4">Lihat semua</Link></div>
        {recent.length === 0 ? <Card><p className="text-sm text-muted">Belum ada pesanan untuk ditampilkan.</p></Card> : <Table headings={['ID Pesanan', 'Pelanggan', 'Layanan', 'Jumlah', 'Status']} rows={recent.map((order) => [<Link className="font-mono font-medium text-ocean transition hover:underline decoration-teal decoration-2 underline-offset-4" to={`/admin/pesanan/${order.id}`} key={order.id}>{order.id}</Link>, order.customer?.name ?? 'Pelanggan', order.service.replace(/_/g, ' '), formatRupiah(order.total), <Badge status={order.status} key={order.status} />])} />}
      </section>
    </>}
  </div>;
}
