import type { PricingConfig } from '../config/pricing';
import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseErrors';
import { validatePricingConfig } from '../lib/adminValidation';

export interface PricingSettingsService {
  get(): Promise<PricingConfig>;
  save(config: PricingConfig): Promise<void>;
}

interface PricingRow { config: unknown }

export const pricingSettingsService: PricingSettingsService = {
  async get() {
    const { data, error } = await supabase.from('pricing_config').select('config').eq('id', 1).maybeSingle();
    if (error) throw new Error(supabaseErrorMessage(error, 'Pengaturan harga gagal dimuat.'));
    if (!data) throw new Error('Pengaturan harga belum tersedia. Jalankan berkas supabase/seed_pricing.sql terlebih dahulu.');
    try { return validatePricingConfig((data as PricingRow).config); }
    catch { throw new Error('Data pengaturan harga tidak valid. Periksa konfigurasi di Supabase.'); }
  },
  async save(config) {
    const { error } = await supabase.from('pricing_config').upsert({
      id: 1,
      config,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) throw new Error(supabaseErrorMessage(error, 'Pengaturan harga gagal disimpan.'));
  },
};
