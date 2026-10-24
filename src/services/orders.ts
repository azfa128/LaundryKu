import { transitionOrderStatus } from '../lib/orderTransitions';
import { orderAttachmentError } from '../lib/orderAttachmentValidation';
import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseErrors';
import type { Order, OrderStatus, User } from '../types';

export interface OrdersService {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  getForCustomer(customerId: string): Promise<Order[]>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'customer' | 'paymentProofPath' | 'bagPhotoPath' | 'paymentProofUrl' | 'bagPhotoUrl'>, attachments: OrderAttachments): Promise<Order>;
  update(id: string, changes: Partial<Pick<Order, 'status' | 'rejectionReason'>>): Promise<Order>;
}

interface OrderRow {
  id: string;
  user_id: string;
  service: Order['service'];
  speed: Order['speed'];
  weight_kg: number | string;
  notes: string | null;
  pickup_lat: number | string;
  pickup_lng: number | string;
  pickup_address: string;
  distance_km: number | string;
  subtotal: number | string;
  pickup_fee: number | string;
  total: number | string;
  status: OrderStatus;
  reject_reason: string | null;
  payment_proof_path: string | null;
  bag_photo_path: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow { id: string; full_name: string; phone: string | null }

export interface OrderAttachments { paymentProof: File; bagPhoto: File }
const ATTACHMENT_BUCKET = 'laundryku-order-attachments';
const MIME_EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerId: row.user_id,
    service: row.service,
    speed: row.speed,
    weightKg: Number(row.weight_kg),
    pickupAddress: row.pickup_address,
    pickupLocation: { lat: Number(row.pickup_lat), lng: Number(row.pickup_lng) },
    distanceKm: Number(row.distance_km),
    notes: row.notes ?? undefined,
    subtotal: Number(row.subtotal),
    pickupFee: Number(row.pickup_fee),
    total: Number(row.total),
    status: row.status,
    rejectionReason: row.reject_reason ?? undefined,
    createdAt: row.created_at,
    paymentProofPath: row.payment_proof_path ?? undefined,
    bagPhotoPath: row.bag_photo_path ?? undefined,
  };
}

function validateAttachment(file: File, label: string): void {
  const error = orderAttachmentError(file, label);
  if (error) throw new Error(error);
}

async function uploadAttachment(userId: string, orderId: string, kind: 'payment-proof' | 'bag-photo', file: File): Promise<string> {
  validateAttachment(file, kind === 'payment-proof' ? 'Bukti pembayaran' : 'Foto tas');
  const path = `${userId}/${orderId}/${kind}.${MIME_EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(supabaseErrorMessage(error, 'Foto gagal diunggah. Periksa koneksi dan izin penyimpanan.'));
  return path;
}

async function withSignedAttachmentUrls(order: Order): Promise<Order> {
  const [paymentProof, bagPhoto] = await Promise.all([
    order.paymentProofPath ? supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(order.paymentProofPath, 3600) : null,
    order.bagPhotoPath ? supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(order.bagPhotoPath, 3600) : null,
  ]);
  if (paymentProof?.error) throw new Error(supabaseErrorMessage(paymentProof.error, 'Bukti pembayaran tidak dapat dibuka.'));
  if (bagPhoto?.error) throw new Error(supabaseErrorMessage(bagPhoto.error, 'Foto tas tidak dapat dibuka.'));
  return { ...order, paymentProofUrl: paymentProof?.data.signedUrl, bagPhotoUrl: bagPhoto?.data.signedUrl };
}

async function attachCustomerProfiles(orders: Order[]): Promise<Order[]> {
  if (!orders.length) return orders;
  const ids = [...new Set(orders.map((order) => order.customerId))];
  const { data, error } = await supabase.from('profiles').select('id, full_name, phone').in('id', ids);
  if (error) throw new Error(supabaseErrorMessage(error, 'Informasi pelanggan gagal dimuat.'));
  const profiles = (data ?? []) as ProfileRow[];
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  return orders.map((order) => {
    const profile = byId.get(order.customerId);
    if (!profile) return order;
    const customer: Pick<User, 'id' | 'name' | 'phone'> = {
      id: profile.id,
      name: profile.full_name,
      phone: profile.phone ?? undefined,
    };
    return { ...order, customer };
  });
}

function throwOrderError(error: unknown, fallback: string): never {
  throw new Error(supabaseErrorMessage(error, fallback));
}

export const ordersService: OrdersService = {
  async getAll() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throwOrderError(error, 'Daftar pesanan gagal dimuat.');
    const orders = ((data ?? []) as OrderRow[]).map(mapOrder);
    return attachCustomerProfiles(orders);
  },
  async getById(id) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (error) throwOrderError(error, 'Detail pesanan gagal dimuat.');
    if (!data) return null;
    const [order] = await attachCustomerProfiles([mapOrder(data as OrderRow)]);
    return withSignedAttachmentUrls(order);
  },
  async getForCustomer(customerId) {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', customerId).order('created_at', { ascending: false });
    if (error) throwOrderError(error, 'Riwayat pesanan gagal dimuat.');
    return ((data ?? []) as OrderRow[]).map(mapOrder);
  },
  async create(order, attachments) {
    validateAttachment(attachments.paymentProof, 'Bukti pembayaran');
    validateAttachment(attachments.bagPhoto, 'Foto tas');
    const id = crypto.randomUUID();
    const uploadedPaths: string[] = [];
    try {
      const paymentProofPath = await uploadAttachment(order.customerId, id, 'payment-proof', attachments.paymentProof);
      uploadedPaths.push(paymentProofPath);
      const bagPhotoPath = await uploadAttachment(order.customerId, id, 'bag-photo', attachments.bagPhoto);
      uploadedPaths.push(bagPhotoPath);
      const row = {
        id,
        user_id: order.customerId,
        service: order.service,
        speed: order.speed,
        weight_kg: order.weightKg,
        notes: order.notes ?? null,
        pickup_lat: order.pickupLocation.lat,
        pickup_lng: order.pickupLocation.lng,
        pickup_address: order.pickupAddress,
        distance_km: order.distanceKm,
        subtotal: order.subtotal,
        pickup_fee: order.pickupFee,
        total: order.total,
        status: 'menunggu_konfirmasi' satisfies OrderStatus,
        reject_reason: null,
        payment_proof_path: paymentProofPath,
        bag_photo_path: bagPhotoPath,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('orders').insert(row).select('*').single();
      if (error) throwOrderError(error, 'Pesanan gagal dibuat. Periksa koneksi dan coba lagi.');
      return mapOrder(data as OrderRow);
    } catch (error) {
      if (uploadedPaths.length) await supabase.storage.from(ATTACHMENT_BUCKET).remove(uploadedPaths);
      throw error;
    }
  },
  async update(id, changes) {
    const current = await this.getById(id);
    if (!current) throw new Error('Pesanan tidak ditemukan.');
    if (changes.status) transitionOrderStatus(current.status, changes.status);
    const row: { status?: OrderStatus; reject_reason?: string | null; updated_at: string } = { updated_at: new Date().toISOString() };
    if (changes.status) row.status = changes.status;
    if ('rejectionReason' in changes) row.reject_reason = changes.rejectionReason ?? null;
    const { data, error } = await supabase.from('orders').update(row).eq('id', id).select('*').maybeSingle();
    if (error) throwOrderError(error, 'Perubahan pesanan gagal disimpan.');
    if (!data) throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses untuk mengubahnya.');
    const [updated] = await attachCustomerProfiles([mapOrder(data as OrderRow)]);
    return withSignedAttachmentUrls(updated);
  },
};
