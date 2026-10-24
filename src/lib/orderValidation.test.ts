import { describe, expect, it } from 'vitest';
import { PRICING } from '../config/pricing';
import { createOrderSchema } from './orderValidation';

describe('validasi form pesanan', () => {
  const schema = createOrderSchema(PRICING.minimumWeightKg, PRICING.weightStepKg);
  const validOrder = { service: 'cuci_kering_lipat', speed: 'reguler', weightKg: 3.5, pickupAddress: 'Jl. Melati No. 12', latitude: -6.9, longitude: 107.6, notes: '' };

  it('menerima pesanan dengan berat minimal dan step yang benar', () => {
    expect(schema.safeParse(validOrder).success).toBe(true);
  });
  it('menolak berat kurang dari minimal atau bukan kelipatan step', () => {
    expect(schema.safeParse({ ...validOrder, weightKg: 2.5 }).success).toBe(false);
    expect(schema.safeParse({ ...validOrder, weightKg: 3.25 }).success).toBe(false);
  });
  it('menolak alamat kosong dan koordinat di luar rentang', () => {
    expect(schema.safeParse({ ...validOrder, pickupAddress: ' ' }).success).toBe(false);
    expect(schema.safeParse({ ...validOrder, latitude: 92 }).success).toBe(false);
  });
});
