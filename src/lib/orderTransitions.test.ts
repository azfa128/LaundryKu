import { describe, expect, it } from 'vitest';
import { canTransitionOrder, transitionOrderStatus } from './orderTransitions';

describe('transisi status pesanan', () => {
  it('menerima hanya transisi yang diizinkan', () => {
    expect(canTransitionOrder('menunggu_konfirmasi', 'dikonfirmasi')).toBe(true);
    expect(canTransitionOrder('menunggu_konfirmasi', 'ditolak')).toBe(true);
    expect(canTransitionOrder('dikonfirmasi', 'dijemput')).toBe(true);
    expect(canTransitionOrder('dijemput', 'diproses')).toBe(true);
    expect(canTransitionOrder('diproses', 'selesai')).toBe(true);
    expect(canTransitionOrder('selesai', 'diproses')).toBe(false);
    expect(canTransitionOrder('ditolak', 'dikonfirmasi')).toBe(false);
  });
  it('melempar error untuk transisi tidak valid', () => {
    expect(() => transitionOrderStatus('selesai', 'dikonfirmasi')).toThrow('tidak valid');
  });
});
