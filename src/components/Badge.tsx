import type { OrderStatus } from '../types';

const statusLabels: Record<OrderStatus, string> = {
  menunggu_konfirmasi: 'Menunggu Konfirmasi', dikonfirmasi: 'Dikonfirmasi', dijemput: 'Dijemput',
  diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};
const statusColors: Record<OrderStatus, string> = {
  menunggu_konfirmasi: 'bg-express text-ink', dikonfirmasi: 'bg-mist text-ocean', dijemput: 'bg-status-pickupBg text-status-pickup',
  diproses: 'bg-status-successBg text-status-success', selesai: 'bg-status-successBg text-status-success', ditolak: 'bg-red-100 text-red-700',
};

export function Badge({ status, children }: { status?: OrderStatus; children?: string }) {
  const label = status ? statusLabels[status] : children;
  if (!label) return null;
  return <span className={`inline-flex rounded-token px-3 py-2 text-xs font-bold ${status ? statusColors[status] : 'bg-mist text-ocean'}`}>{label}</span>;
}
