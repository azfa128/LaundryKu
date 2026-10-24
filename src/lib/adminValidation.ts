import { z } from 'zod';
import { PRICING } from '../config/pricing';

const nonnegativeMoney = z.preprocess((value) => typeof value === 'string' && value.trim() === '' ? Number.NaN : Number(value),
  z.number({ required_error: 'Nilai wajib diisi.', invalid_type_error: 'Masukkan angka yang valid.' }).finite('Masukkan angka yang valid.').nonnegative('Nilai tidak boleh negatif.'));

export const adminLoginSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi.' }).trim().min(1, 'Email wajib diisi.').email('Email tidak valid.'),
  password: z.string({ required_error: 'Kata sandi wajib diisi.' }).min(8, 'Kata sandi minimal 8 karakter.'),
});

export const pricingSchema = z.object({
  services: z.object({
    cuci_kering_lipat: z.object({ label: z.string({ required_error: 'Nama layanan wajib tersedia.' }), prices: z.object({ reguler: nonnegativeMoney, express: nonnegativeMoney, kilat: nonnegativeMoney }) }),
    cuci_setrika: z.object({ label: z.string({ required_error: 'Nama layanan wajib tersedia.' }), prices: z.object({ reguler: nonnegativeMoney, express: nonnegativeMoney, kilat: nonnegativeMoney }) }),
    setrika_saja: z.object({ label: z.string({ required_error: 'Nama layanan wajib tersedia.' }), prices: z.object({ reguler: nonnegativeMoney, express: nonnegativeMoney, kilat: nonnegativeMoney }) }),
  }),
  minimumWeightKg: z.coerce.number({ required_error: 'Berat minimal wajib diisi.', invalid_type_error: 'Masukkan berat minimal.' }).finite('Berat minimal harus berupa angka.').positive('Berat minimal harus lebih dari nol.'),
  weightStepKg: z.coerce.number({ required_error: 'Kenaikan berat wajib tersedia.', invalid_type_error: 'Kenaikan berat tidak valid.' }).positive('Kenaikan berat harus lebih dari nol.'),
  pickup: z.object({
    freeWithinKm: z.coerce.number({ required_error: 'Jarak gratis wajib diisi.', invalid_type_error: 'Masukkan jarak gratis.' }).finite('Jarak gratis harus berupa angka.').nonnegative('Jarak gratis tidak boleh negatif.'),
    pricePerKm: nonnegativeMoney,
  }),
  speeds: z.object({ reguler: z.string({ required_error: 'Nama kecepatan wajib tersedia.' }), express: z.string({ required_error: 'Nama kecepatan wajib tersedia.' }), kilat: z.string({ required_error: 'Nama kecepatan wajib tersedia.' }) }),
});

export type PricingFormValues = z.infer<typeof pricingSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export function validatePricingConfig(value: unknown): PricingFormValues {
  return pricingSchema.parse(value ?? structuredClone(PRICING));
}
