import { ORDER_ATTACHMENT_MAX_SIZE_MB } from '../config/payment';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function orderAttachmentError(file: Pick<File, 'type' | 'size'>, label: string): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return `${label} harus berupa gambar JPG, PNG, atau WebP.`;
  if (file.size > ORDER_ATTACHMENT_MAX_SIZE_MB * 1024 * 1024) return `${label} maksimal berukuran ${ORDER_ATTACHMENT_MAX_SIZE_MB} MB.`;
  return null;
}
