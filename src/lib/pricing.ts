import { PRICING, type LaundryService, type ServiceSpeed } from '../config/pricing';
import type { PricingConfig } from '../config/pricing';

export interface PriceSummary { subtotal: number; pickupFee: number; total: number }

export function calculatePrice(service: LaundryService, speed: ServiceSpeed, weightKg: number, distanceKm: number, pricing: PricingConfig = PRICING): PriceSummary {
  if (!Number.isFinite(weightKg) || weightKg < pricing.minimumWeightKg) throw new RangeError(`Berat minimal ${pricing.minimumWeightKg} kg.`);
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new RangeError('Jarak jemput tidak valid.');
  const currentService = pricing.services[service] ?? PRICING.services[service];
  const subtotal = currentService.prices[speed] * weightKg;
  const chargeableDistance = Math.max(0, Math.ceil(distanceKm - pricing.pickup.freeWithinKm));
  const pickupFee = chargeableDistance * pricing.pickup.pricePerKm;
  return { subtotal, pickupFee, total: subtotal + pickupFee };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}
