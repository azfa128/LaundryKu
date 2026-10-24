import type { OrderStatus } from '../types';

const validNextStatuses: Record<OrderStatus, readonly OrderStatus[]> = {
  menunggu_konfirmasi: ['dikonfirmasi', 'ditolak'],
  dikonfirmasi: ['dijemput'],
  dijemput: ['diproses'],
  diproses: ['selesai'],
  selesai: [],
  ditolak: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return validNextStatuses[from].includes(to);
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  return validNextStatuses[status].find((nextStatus) => nextStatus !== 'ditolak') ?? null;
}

export function transitionOrderStatus(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransitionOrder(from, to)) throw new Error(`Perubahan status dari ${from} ke ${to} tidak valid.`);
  return to;
}
