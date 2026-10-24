export function supabaseErrorMessage(error: unknown, fallback: string): string {
  const detail = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  const normalized = detail.toLocaleLowerCase('en-US');

  if (/failed to fetch|network|fetch error|timeout|timed out/.test(normalized)) {
    return 'Koneksi gagal. Periksa jaringan internet Anda, lalu coba lagi.';
  }
  if (/invalid login credentials|invalid credentials|wrong password|email or password/.test(normalized)) {
    return 'Email atau kata sandi salah.';
  }
  if (/already registered|already exists|user exists|email.*(taken|registered)/.test(normalized)) {
    return 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.';
  }
  if (/bucket.*(not found|does not exist)|no such bucket/.test(normalized)) {
    return 'Penyimpanan lampiran belum disiapkan. Jalankan supabase/order_attachments.sql di SQL Editor Supabase.';
  }
  if (/row-level security/.test(normalized)) {
    return 'Upload ditolak oleh aturan akses Storage. Jalankan supabase/order_attachments.sql dan pastikan policy Storage sudah aktif.';
  }
  if (/permission denied|not authorized|unauthorized|jwt expired/.test(normalized)) {
    return 'Akses ditolak. Periksa akun dan izin Anda, lalu coba lagi.';
  }
  return fallback;
}
