export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export type OrderStatus = 'menunggu_konfirmasi' | 'dikonfirmasi' | 'dijemput' | 'diproses' | 'selesai' | 'ditolak';

export interface Order {
  id: string;
  customerId: string;
  service: 'cuci_kering_lipat' | 'cuci_setrika' | 'setrika_saja';
  speed: 'reguler' | 'express' | 'kilat';
  weightKg: number;
  pickupAddress: string;
  pickupLocation: { lat: number; lng: number };
  distanceKm: number;
  notes?: string;
  subtotal: number;
  pickupFee: number;
  total: number;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  customer?: Pick<User, 'id' | 'name' | 'phone'>;
}
