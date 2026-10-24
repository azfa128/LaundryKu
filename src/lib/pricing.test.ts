import { describe, expect, it } from 'vitest';
import { calculatePrice } from './pricing';

describe('calculatePrice', () => {
  it('menghitung subtotal dan jemput gratis dalam jarak tiga kilometer', () => {
    expect(calculatePrice('cuci_kering_lipat', 'reguler', 3, 2.5)).toEqual({ subtotal: 21000, pickupFee: 0, total: 21000 });
  });
  it('menghitung biaya untuk jarak di luar batas gratis', () => {
    expect(calculatePrice('cuci_setrika', 'express', 3.5, 5)).toEqual({ subtotal: 49000, pickupFee: 4000, total: 53000 });
  });
  it('menolak berat di bawah minimum', () => {
    expect(() => calculatePrice('setrika_saja', 'kilat', 2.5, 1)).toThrow(RangeError);
  });
});
