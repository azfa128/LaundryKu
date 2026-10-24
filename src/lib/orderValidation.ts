import { z } from 'zod';
import type { LaundryService, ServiceSpeed } from '../config/pricing';

export function createOrderSchema(minimumWeightKg: number, weightStepKg: number) {
  return z.object({
    service: z.enum(['cuci_kering_lipat', 'cuci_setrika', 'setrika_saja'], { required_error: 'Pilih layanan cucian.', invalid_type_error: 'Pilih layanan cucian.' }),
    speed: z.enum(['reguler', 'express', 'kilat'], { required_error: 'Pilih kecepatan layanan.', invalid_type_error: 'Pilih kecepatan layanan.' }),
    weightKg: z.number({ required_error: 'Berat cucian wajib diisi.', invalid_type_error: 'Masukkan berat cucian.' }).finite('Masukkan berat yang valid.')
      .min(minimumWeightKg, `Berat minimal ${minimumWeightKg} kg.`)
      .refine((weight) => Number.isInteger((weight - minimumWeightKg) / weightStepKg), `Berat harus bertambah dalam kelipatan ${weightStepKg} kg.`),
    pickupAddress: z.string({ required_error: 'Alamat jemput wajib diisi.' }).trim().min(1, 'Alamat jemput wajib diisi.'),
    latitude: z.number({ required_error: 'Pilih titik jemput pada peta.', invalid_type_error: 'Koordinat titik jemput tidak valid.' }).min(-90, 'Koordinat latitude tidak valid.').max(90, 'Koordinat latitude tidak valid.'),
    longitude: z.number({ required_error: 'Pilih titik jemput pada peta.', invalid_type_error: 'Koordinat titik jemput tidak valid.' }).min(-180, 'Koordinat longitude tidak valid.').max(180, 'Koordinat longitude tidak valid.'),
    notes: z.string({ required_error: 'Catatan tidak valid.' }).max(500, 'Catatan maksimal 500 karakter.'),
  });
}

export type OrderFormValues = {
  service: LaundryService;
  speed: ServiceSpeed;
  weightKg: number;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  notes: string;
};
