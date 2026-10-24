import type { Order } from '../types';

export type LaundryService = Order['service'];
export type ServiceSpeed = Order['speed'];

export interface PricingConfig {
  services: Record<LaundryService, { label: string; prices: Record<ServiceSpeed, number> }>;
  minimumWeightKg: number;
  weightStepKg: number;
  pickup: { freeWithinKm: number; pricePerKm: number };
  speeds: Record<ServiceSpeed, string>;
}

export const PRICING: PricingConfig = {
  services: {
    cuci_kering_lipat: { label: 'Cuci Kering Lipat', prices: { reguler: 7000, express: 11000, kilat: 16000 } },
    cuci_setrika: { label: 'Cuci + Setrika', prices: { reguler: 9000, express: 14000, kilat: 20000 } },
    setrika_saja: { label: 'Setrika Saja', prices: { reguler: 6000, express: 10000, kilat: 15000 } },
  } satisfies Record<LaundryService, { label: string; prices: Record<ServiceSpeed, number> }>,
  minimumWeightKg: 3,
  weightStepKg: 0.5,
  pickup: { freeWithinKm: 3, pricePerKm: 2000 },
  speeds: { reguler: 'Reguler (2–3 hari)', express: 'Express (1 hari)', kilat: 'Kilat (6 jam)' },
};
