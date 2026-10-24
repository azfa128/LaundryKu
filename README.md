# LaundryKu

Aplikasi laundry dengan React 18, Vite, TypeScript, Tailwind CSS, React Router, React Leaflet, React Hook Form, Zod, Vitest, dan Supabase.

## Menyiapkan Supabase

1. Buat project baru di [Supabase](https://supabase.com/dashboard).
2. Aktifkan penyedia autentikasi Email di **Authentication → Providers**. Atur konfirmasi email sesuai kebijakan project.
3. Pastikan tabel `profiles`, `orders`, dan `pricing_config` serta kebijakan RLS yang digunakan aplikasi sudah tersedia di project. Aplikasi ini tidak membuat atau mengubah skema tabel.
4. Salin `.env.example` menjadi `.env.local`, lalu isi URL project dan publishable anon key dari **Project Settings → API**:

   ```dotenv
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

5. Jalankan isi [`supabase/seed_pricing.sql`](supabase/seed_pricing.sql) di **SQL Editor** untuk memasukkan konfigurasi harga awal. Perintah seed tidak menimpa konfigurasi yang sudah ada.

Role pengguna dibaca dari `profiles.role`. Pendaftaran mengirim `full_name` dan `phone` pada metadata autentikasi; siapkan mekanisme project yang mengisi baris `profiles` untuk akun baru.

### Menjadikan akun sebagai admin

Buat akun lewat form Daftar terlebih dahulu. Ambil UUID akun tersebut dari **Authentication → Users**, lalu ubah role profilnya melalui SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID_AKUN_DARI_AUTH_USERS';
```

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Verifikasi lokal:

```bash
npm test
npm run build
```
