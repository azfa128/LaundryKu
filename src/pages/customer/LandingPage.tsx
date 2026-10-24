import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import type { PricingConfig } from '../../config/pricing';
import { formatRupiah } from '../../lib/pricing';
import { pricingSettingsService } from '../../services/pricingSettings';

const speedCards = [
  { key: 'reguler', name: 'Reguler', duration: 'Selesai 2–3 hari' },
  { key: 'express', name: 'Express', duration: 'Selesai 1 hari' },
  { key: 'kilat', name: 'Kilat', duration: 'Selesai 6 jam' },
] as const;

export function LandingPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    void pricingSettingsService.get().then(setPricing).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Harga layanan gagal dimuat. Silakan coba lagi.');
    }).finally(() => setLoading(false));
  }, []);
  return <main>
    <section className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:pb-16 sm:pt-14">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ocean">Laundry cepat, antar sampai depan pintu</p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-ink sm:text-5xl">Pakaian bersih,<br className="hidden sm:block" /> waktu lebih lega.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">Kami jemput, cuci, dan antar kembali. Kamu tinggal menikmati waktu yang lebih berharga.</p>
        <button type="button" onClick={() => navigate('/pesan')} className="mt-5 inline-flex w-full items-center justify-center rounded-token bg-teal px-4 py-3 font-semibold text-ink shadow-soft transition hover:bg-softlime hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 sm:w-auto">Pesan Sekarang <span className="ml-2" aria-hidden="true">→</span></button>
      </div>
      <section className="mt-9" aria-labelledby="package-title"><h2 id="package-title" className="font-heading text-lg font-extrabold text-ink">Pilih layanan laundry</h2>{loading && <p role="status" className="mt-3 text-sm text-muted">Memuat harga layanan...</p>}{error && <p role="alert" className="mt-3 rounded-token bg-red-50 p-3 text-sm text-red-700">{error}</p>}{pricing && <div className="mt-3 grid gap-3 sm:grid-cols-3">{speedCards.map((speed) => <Card key={speed.key} className={speed.key === 'express' ? 'border-transparent bg-mist' : ''}><div className="flex items-start justify-between gap-2"><h3 className="font-heading font-bold text-ink">{speed.name}</h3>{speed.key === 'express' && <Badge>EXPRESS</Badge>}</div><p className="mt-2 font-mono text-lg font-bold text-ocean">{formatRupiah(pricing.services.cuci_kering_lipat.prices[speed.key])} <span className="text-xs font-medium">/ kg</span></p><p className="mt-1 text-xs text-muted">{speed.duration}</p></Card>)}</div>}{!pricing && !loading && <p className="mt-3 text-sm text-muted">Harga layanan belum dapat ditampilkan.</p>}</section>
      <section className="mt-9" aria-labelledby="steps-title"><h2 id="steps-title" className="font-heading text-lg font-extrabold text-ink">Cara kerja</h2><div className="mt-3 grid grid-cols-3 gap-2">{[['01', 'Jemput'], ['02', 'Cuci'], ['03', 'Antar']].map(([number, label]) => <div key={number} className="rounded-token border border-line/70 bg-lavender p-3 shadow-soft"><p className="font-mono text-[10px] font-bold text-ocean">{number}</p><p className="mt-1 text-xs font-bold text-ink sm:text-sm">{label}</p></div>)}</div></section>
    </section>
  </main>;
}
