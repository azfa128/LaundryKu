import type { OrderStatus } from '../types';

const statusLabels: Record<OrderStatus, string> = {
  menunggu_konfirmasi: 'Menunggu Konfirmasi', dikonfirmasi: 'Dikonfirmasi', dijemput: 'Dijemput',
  diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};
const statusColors: Record<OrderStatus, string> = {
  menunggu_konfirmasi: 'bg-softlime text-ink', dikonfirmasi: 'bg-lavender text-ink', dijemput: 'bg-peach text-ink',
  diproses: 'bg-lavender text-ink', selesai: 'bg-softlime text-ink', ditolak: 'bg-peach text-ink',
};

export function Badge({ status, children }: { status?: OrderStatus; children?: string }) {
  const label = status ? statusLabels[status] : children;
  if (!label) return null;
  return <span className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${status ? statusColors[status] : 'bg-teal text-ink'}`}>{label}</span>;
}
