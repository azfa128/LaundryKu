import { describe, expect, it } from 'vitest';
import { PRICING } from '../config/pricing';
import { pricingSchema } from './adminValidation';

describe('validasi pengaturan harga', () => {
  it('menerima konfigurasi harga yang valid', () => {
    expect(pricingSchema.safeParse(PRICING).success).toBe(true);
  });
  it('menolak harga kosong, negatif, dan berat minimum nol', () => {
    const emptyPrice = structuredClone(PRICING);
    emptyPrice.services.cuci_setrika.prices.express = '' as unknown as number;
    expect(pricingSchema.safeParse(emptyPrice).success).toBe(false);
    const negativeFee = structuredClone(PRICING);
    negativeFee.pickup.pricePerKm = -1;
    expect(pricingSchema.safeParse(negativeFee).success).toBe(false);
    const invalidMinimum = structuredClone(PRICING);
    invalidMinimum.minimumWeightKg = 0;
    expect(pricingSchema.safeParse(invalidMinimum).success).toBe(false);
  });
});
