import { describe, expect, it } from 'vitest';
import { orderAttachmentError } from './orderAttachmentValidation';

describe('validasi lampiran pesanan', () => {
  it('menerima gambar JPG, PNG, dan WebP yang ukurannya diizinkan', () => {
    expect(orderAttachmentError({ type: 'image/jpeg', size: 1024 }, 'Bukti')).toBeNull();
    expect(orderAttachmentError({ type: 'image/png', size: 1024 }, 'Foto')).toBeNull();
    expect(orderAttachmentError({ type: 'image/webp', size: 1024 }, 'Foto')).toBeNull();
  });

  it('menolak format lain dan ukuran di atas batas', () => {
    expect(orderAttachmentError({ type: 'application/pdf', size: 1024 }, 'Bukti')).toContain('JPG, PNG, atau WebP');
    expect(orderAttachmentError({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }, 'Foto')).toContain('5 MB');
  });
});
