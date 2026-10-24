import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
