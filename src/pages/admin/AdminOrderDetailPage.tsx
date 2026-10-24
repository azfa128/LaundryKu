import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { formatRupiah } from '../../lib/pricing';
import { canTransitionOrder, getNextOrderStatus, transitionOrderStatus } from '../../lib/orderTransitions';
import { ordersService } from '../../services/orders';
import type { Order, OrderStatus } from '../../types';
import '../../lib/leaflet';

const nextAction: Partial<Record<OrderStatus, string>> = { dikonfirmasi: 'Tandai Dijemput', dijemput: 'Tandai Diproses', diproses: 'Tandai Selesai' };

export function AdminOrderDetailPage() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLoading(true); void ordersService.getById(id).then(setOrder).catch(() => setError('Detail pesanan gagal dimuat.')).finally(() => setLoading(false)); }, [id]);

  async function updateStatus(status: OrderStatus, rejectionReason?: string) {
    if (!order || !canTransitionOrder(order.status, status)) return;
    setSaving(true); setError('');
    try {
      const nextOrder = await ordersService.update(order.id, { status: transitionOrderStatus(order.status, status), rejectionReason });
      setOrder(nextOrder); setRejectOpen(false); setReason(''); setReasonError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Status pesanan gagal diperbarui.');
    } finally { setSaving(false); }
  }

  function rejectOrder() {
    const cleanReason = reason.trim();
    if (!cleanReason) { setReasonError('Alasan penolakan wajib diisi.'); return; }
    void updateStatus('ditolak', cleanReason);
  }

  if (loading) return <p role="status" className="text-sm text-muted">Memuat detail pesanan...</p>;
  if (error && !order) return <p role="alert" className="rounded-token bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!order) return <Card><h1 className="font-heading text-xl font-bold">Pesanan tidak ditemukan</h1><p className="mt-2 text-sm text-muted">Periksa kembali ID pesanan.</p></Card>;

  const customer = order.customer;
  const nextStatus = getNextOrderStatus(order.status);
  const mayReject = order.status === 'menunggu_konfirmasi' && canTransitionOrder(order.status, 'ditolak');

  return <div className="mx-auto max-w-[1000px] space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-ocean">Detail pesanan</p><h1 className="mt-2 font-heading text-2xl font-extrabold text-ink">Pesanan {order.id}</h1></div><Badge status={order.status} /></header>
    {error && <p role="alert" className="rounded-token bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><h2 className="font-heading text-lg font-bold">Pelanggan</h2><dl className="mt-3 grid grid-cols-[130px_1fr] gap-y-2 text-sm"><dt className="text-muted">Nama</dt><dd>{customer?.name ?? 'Pelanggan'}</dd><dt className="text-muted">Telepon</dt><dd>{customer?.phone ?? '—'}</dd><dt className="text-muted">Alamat jemput</dt><dd>{order.pickupAddress}</dd></dl></Card>
      <Card><h2 className="font-heading text-lg font-bold">Rincian harga</h2><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">{order.service.replace(/_/g, ' ')} · {order.speed} · {order.weightKg} kg</dt><dd>{formatRupiah(order.subtotal)}</dd></div><div className="flex justify-between"><dt className="text-muted">Biaya jemput</dt><dd>{formatRupiah(order.pickupFee)}</dd></div><div className="flex justify-between border-t border-line pt-2 font-bold"><dt>Total</dt><dd>{formatRupiah(order.total)}</dd></div></dl>{order.notes && <p className="mt-4 border-t border-line pt-3 text-sm"><span className="font-semibold">Catatan:</span> {order.notes}</p>}{order.rejectionReason && <p className="mt-3 rounded-token bg-red-50 p-3 text-sm text-red-700"><strong>Alasan penolakan:</strong> {order.rejectionReason}</p>}</Card>
    </div>
    <section><h2 className="mb-3 font-heading text-lg font-bold">Lokasi jemput</h2><div className="h-64 overflow-hidden rounded-token border border-line shadow-soft"><MapContainer center={[order.pickupLocation.lat, order.pickupLocation.lng]} zoom={15} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false} className="h-full w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={[order.pickupLocation.lat, order.pickupLocation.lng]} /></MapContainer></div><p className="mt-2 text-xs text-muted">Titik jemput: {order.pickupLocation.lat.toFixed(5)}, {order.pickupLocation.lng.toFixed(5)}</p></section>
    <section className="grid gap-4 md:grid-cols-2">
      <Card><h2 className="mb-3 font-heading font-bold text-ink">Bukti pembayaran GoPay</h2>{order.paymentProofUrl ? <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="block"><img src={order.paymentProofUrl} alt={`Bukti pembayaran pesanan ${order.id}`} className="h-64 w-full rounded-token bg-ground object-contain" /></a> : <p className="text-sm text-muted">Bukti pembayaran belum tersedia.</p>}</Card>
      <Card><h2 className="mb-3 font-heading font-bold text-ink">Foto tas cucian</h2>{order.bagPhotoUrl ? <a href={order.bagPhotoUrl} target="_blank" rel="noreferrer" className="block"><img src={order.bagPhotoUrl} alt={`Foto tas cucian pesanan ${order.id}`} className="h-64 w-full rounded-token bg-ground object-contain" /></a> : <p className="text-sm text-muted">Foto tas belum tersedia.</p>}</Card>
    </section>
    <div className="flex flex-wrap gap-3">
      {order.status === 'menunggu_konfirmasi' && <Button disabled={saving} onClick={() => void updateStatus('dikonfirmasi')}>Konfirmasi</Button>}
      {nextStatus && nextAction[order.status] && <Button disabled={saving} onClick={() => void updateStatus(nextStatus)}>{saving ? 'Menyimpan...' : nextAction[order.status]}</Button>}
      {mayReject && <Button variant="danger" disabled={saving} onClick={() => setRejectOpen(true)}>Tolak</Button>}
      {(order.status === 'selesai' || order.status === 'ditolak') && <p className="self-center text-sm text-muted">Status pesanan ini sudah final.</p>}
    </div>
    <Modal open={rejectOpen} title="Tolak pesanan" onClose={() => { setRejectOpen(false); setReasonError(''); }}><p className="mb-4 text-sm text-muted">Berikan alasan penolakan agar pelanggan mendapat informasi yang jelas.</p><Input label="Alasan penolakan" value={reason} onChange={(event) => setReason(event.target.value)} error={reasonError} placeholder="Contoh: Area belum terjangkau layanan" /><div className="mt-5 flex justify-end gap-3"><Button variant="outline" onClick={() => setRejectOpen(false)}>Batal</Button><Button variant="danger" disabled={saving} onClick={rejectOrder}>{saving ? 'Menyimpan...' : 'Tolak pesanan'}</Button></div></Modal>
  </div>;
}
