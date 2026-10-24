import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { formatRupiah } from '../../lib/pricing';
import { ordersService } from '../../services/orders';
import type { Order, OrderStatus } from '../../types';

const statusOptions: { value: OrderStatus | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua status' }, { value: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
  { value: 'dikonfirmasi', label: 'Dikonfirmasi' }, { value: 'dijemput', label: 'Dijemput' },
  { value: 'diproses', label: 'Diproses' }, { value: 'selesai', label: 'Selesai' }, { value: 'ditolak', label: 'Ditolak' },
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | 'semua'>('semua');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void ordersService.getAll().then(setOrders).catch(() => setError('Data pesanan gagal dimuat. Muat ulang halaman untuk mencoba kembali.')).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => orders.filter((order) => {
    const customerName = order.customer?.name ?? '';
    const matchesStatus = status === 'semua' || order.status === status;
    const matchesQuery = `${order.id} ${customerName}`.toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID'));
    return matchesStatus && matchesQuery;
  }), [orders, status, query]);

  return <div className="mx-auto max-w-[1060px] space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-wider text-ocean">Operasional</p><h1 className="mt-2 font-heading text-2xl font-extrabold text-ink">Daftar pesanan</h1><p className="mt-1 text-sm text-muted">Kelola pesanan pelanggan dan status layanan.</p></header>
    <div className="grid gap-3 md:grid-cols-[1fr_240px]">
      <label className="block text-sm font-semibold text-ink">Cari pesanan<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ID atau nama pelanggan" className="mt-2 w-full rounded-token border border-line bg-card px-4 py-3 font-normal shadow-sm outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-teal/70" /></label>
      <Select label="Filter status" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | 'semua')}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>
    </div>
    {error && <p role="alert" className="rounded-token bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p role="status" className="text-sm text-muted">Memuat daftar pesanan...</p> : filtered.length === 0 ? <section className="rounded-token border border-dashed border-line bg-card p-8 text-center shadow-soft"><h2 className="font-semibold text-ink">{orders.length ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}</h2><p className="mt-2 text-sm text-muted">{orders.length ? 'Coba ubah kata kunci atau filter status.' : 'Pesanan pelanggan akan muncul di sini.'}</p></section> : <Table headings={['ID Pesanan', 'Pelanggan', 'Paket', 'Total', 'Status', '']} rows={filtered.map((order) => [<Link key={order.id} to={`/admin/pesanan/${order.id}`} className="font-mono font-semibold text-ocean transition hover:text-ink">{order.id}</Link>, order.customer?.name ?? 'Pelanggan', `${order.service.replace(/_/g, ' ')} · ${order.weightKg} kg`, formatRupiah(order.total), <Badge status={order.status} key={order.status} />, <Link key={`detail-${order.id}`} to={`/admin/pesanan/${order.id}`} className="font-semibold text-ocean transition hover:text-ink">Detail →</Link>])} />}
  </div>;
}
