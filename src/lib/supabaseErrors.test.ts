import { describe, expect, it } from 'vitest';
import { supabaseErrorMessage } from './supabaseErrors';

describe('pesan error Supabase', () => {
  it('mengarahkan bucket lampiran yang belum tersedia ke SQL penyiapan', () => {
    expect(supabaseErrorMessage(new Error('Bucket not found'), 'Gagal')).toContain('supabase/order_attachments.sql');
  });

  it('menjelaskan penolakan policy Storage dalam Bahasa Indonesia', () => {
    expect(supabaseErrorMessage(new Error('new row violates row-level security policy'), 'Gagal')).toContain('aturan akses Storage');
  });
});
