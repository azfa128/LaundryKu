import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../services/AuthContext';

const loginSchema = z.object({ email: z.string({ required_error: 'Email wajib diisi.' }).trim().min(1, 'Email wajib diisi.').email('Email tidak valid.'), password: z.string({ required_error: 'Kata sandi wajib diisi.' }).min(8, 'Kata sandi minimal 8 karakter.') });
const registerSchema = loginSchema.extend({ name: z.string({ required_error: 'Nama wajib diisi.' }).trim().min(1, 'Nama wajib diisi.'), phone: z.string({ required_error: 'Nomor WhatsApp wajib diisi.' }).trim().min(8, 'Nomor WhatsApp tidak valid.') });
type AuthFormValues = { email: string; password: string; name: string; phone: string };

export function CustomerAuthPage() {
  const isRegister = useLocation().pathname === '/daftar';
  const navigate = useNavigate();
  const { login, register: createAccount, logout } = useAuth();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<AuthFormValues>({ defaultValues: { email: '', password: '', name: '', phone: '' } });

  async function onSubmit(values: AuthFormValues) {
    setServerError('');
    const result = isRegister ? registerSchema.safeParse(values) : loginSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'email' || field === 'password' || field === 'name' || field === 'phone') setError(field, { message: issue.message });
      }
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        const details = result.data as z.infer<typeof registerSchema>;
        await createAccount(details);
      } else {
        const user = await login(result.data);
        if (user.role !== 'customer') {
          await logout();
          setServerError('Akun admin tidak dapat masuk melalui login pelanggan. Silakan gunakan login admin.');
          return;
        }
      }
      navigate('/pesan', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="mx-auto min-h-[calc(100vh-65px)] max-w-[440px] px-5 py-8 sm:py-12">
    <Link to="/" className="font-heading text-xl font-extrabold text-ocean">◉ LaundryKu</Link>
    <h1 className="mt-8 font-heading text-2xl font-extrabold text-ink">{isRegister ? 'Buat akun LaundryKu' : 'Selamat datang'}</h1>
    <p className="mt-2 text-sm text-muted">{isRegister ? 'Daftar untuk mulai memesan layanan laundry.' : 'Masuk untuk mengelola pesanan laundry.'}</p>
    <div className="mt-5 flex gap-5 border-b border-line text-xs font-bold uppercase tracking-wide">
      <Link to="/login" className={`pb-3 ${!isRegister ? 'border-b-2 border-ocean text-ocean' : 'text-muted'}`}>Masuk</Link>
      <Link to="/daftar" className={`pb-3 ${isRegister ? 'border-b-2 border-ocean text-ocean' : 'text-muted'}`}>Daftar</Link>
    </div>
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="mt-5 space-y-3">
      {isRegister && <Input label="Nama lengkap" placeholder="Nama Anda" autoComplete="name" error={errors.name?.message} {...register('name')} />}
      {isRegister && <Input label="Nomor WhatsApp" type="tel" placeholder="+62 812-3456-7890" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />}
      <Input label="Email" type="email" placeholder="nama@email.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input label="Kata sandi" type="password" placeholder="••••••••" autoComplete={isRegister ? 'new-password' : 'current-password'} error={errors.password?.message} {...register('password')} />
      {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">{submitting ? 'Memproses...' : isRegister ? 'Daftar' : 'Masuk'}</Button>
    </form>
  </main>;
}
