import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../services/AuthContext';
import { adminLoginSchema, type AdminLoginValues } from '../../lib/adminValidation';

export function AdminLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<AdminLoginValues>();

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  async function onSubmit(values: AdminLoginValues) {
    setFormError('');
    const result = adminLoginSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'email' || field === 'password') setError(field, { message: issue.message });
      }
      return;
    }
    setSubmitting(true);
    try {
      const authenticatedUser = await login(result.data);
      if (authenticatedUser.role !== 'admin') {
        await logout();
        setFormError('Akun pelanggan tidak dapat masuk ke halaman admin. Silakan gunakan login pelanggan.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-ground md:flex">
    <aside className="bg-sidebar p-5 text-white md:min-h-screen md:w-[220px] md:border-r md:border-line">
      <Link to="/" className="font-heading text-xl font-extrabold text-teal">◉ LaundryKu</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-white/60">Area internal</p>
      <p className="mt-2 text-sm text-white/90">Admin</p>
    </aside>
    <section className="flex-1 px-5 py-10 md:px-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-ocean">Admin LaundryKu</p>
        <h1 className="mt-3 font-heading text-2xl font-extrabold text-ink">Masuk ke panel operasional</h1>
        <p className="mt-2 text-sm text-muted">Gunakan kredensial staf LaundryKu.</p>
        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="mt-7 max-w-xl space-y-4" noValidate>
          <Input label="Email staf" type="email" autoComplete="username" placeholder="admin@laundryku.id" error={errors.email?.message} {...register('email')} />
          <Input label="Kata sandi" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Memeriksa...' : 'Masuk sebagai admin'}</Button>
        </form>
      </div>
    </section>
  </main>;
}
