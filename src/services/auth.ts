import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseErrors';
import type { User, UserRole } from '../types';

export interface AuthCredentials { email: string; password: string }
export interface RegisterDetails extends AuthCredentials { name: string; phone: string }
export type AuthStateCallback = (user: User | null, error?: Error) => void;
export interface AuthService {
  login(credentials: AuthCredentials): Promise<User>;
  register(details: RegisterDetails): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: AuthStateCallback): () => void;
}

interface ProfileRow { id: string; full_name: string; phone: string | null; role: string }

async function mapProfile(authUser: SupabaseUser): Promise<User> {
  const { data, error } = await supabase.from('profiles').select('id, full_name, phone, role').eq('id', authUser.id).maybeSingle();
  if (error) throw new Error(supabaseErrorMessage(error, 'Profil akun gagal dimuat. Silakan coba lagi.'));
  if (!data) throw new Error('Profil akun belum tersedia. Hubungi pengelola LaundryKu.');
  const profile = data as ProfileRow;
  if (profile.role !== 'customer' && profile.role !== 'admin') throw new Error('Role akun tidak valid. Hubungi pengelola LaundryKu.');
  return { id: profile.id, name: profile.full_name, email: authUser.email ?? '', phone: profile.phone ?? undefined, role: profile.role as UserRole };
}

function authFailure(error: unknown, fallback: string): Error {
  return new Error(supabaseErrorMessage(error, fallback));
}

export const authService: AuthService = {
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw authFailure(error, 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    if (!data.user) throw new Error('Login gagal karena sesi akun tidak ditemukan. Silakan coba lagi.');
    try { return await mapProfile(data.user); }
    catch (error) { await supabase.auth.signOut(); throw error; }
  },
  async register({ email, password, name, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim(), phone: phone.trim() } },
    });
    if (error) throw authFailure(error, 'Pendaftaran gagal. Periksa kembali data Anda.');
    if (!data.user) throw new Error('Pendaftaran gagal. Akun tidak berhasil dibuat.');
    if (!data.session) throw new Error('Pendaftaran berhasil. Periksa email Anda untuk menyelesaikan verifikasi sebelum masuk.');
    try { return await mapProfile(data.user); }
    catch (error) { await supabase.auth.signOut(); throw error; }
  },
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw authFailure(error, 'Keluar gagal. Periksa koneksi Anda dan coba lagi.');
  },
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw authFailure(error, 'Sesi gagal diperiksa. Muat ulang halaman atau coba lagi.');
    if (!data.session?.user) return null;
    return mapProfile(data.session.user);
  },
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!session?.user) { callback(null); return; }
      void mapProfile(session.user).then((user) => callback(user)).catch((error: unknown) => {
        callback(null, error instanceof Error ? error : new Error('Profil akun gagal dimuat.'));
      });
    });
    return () => subscription.unsubscribe();
  },
};

export type { UserRole };
