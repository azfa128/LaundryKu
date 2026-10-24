import { describe, expect, it } from 'vitest';
import { calculateDistanceKm } from './distance';

describe('calculateDistanceKm', () => {
  it('mengembalikan nol untuk titik yang sama', () => {
    expect(calculateDistanceKm({ lat: -6.9, lng: 107.6 }, { lat: -6.9, lng: 107.6 })).toBe(0);
  });
  it('menghitung jarak Bandung ke titik yang berjarak sekitar satu kilometer', () => {
    const distance = calculateDistanceKm({ lat: -6.9175, lng: 107.6191 }, { lat: -6.9265, lng: 107.6191 });
    expect(distance).toBeGreaterThan(0.9);
    expect(distance).toBeLessThan(1.1);
  });
});
