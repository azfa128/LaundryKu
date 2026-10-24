import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { PRICING } from '../../config/pricing';
import { pricingSchema, type PricingFormValues } from '../../lib/adminValidation';
import { pricingSettingsService } from '../../services/pricingSettings';

const services: { key: keyof PricingFormValues['services']; label: string }[] = [
  { key: 'cuci_kering_lipat', label: 'Cuci + lipat' }, { key: 'cuci_setrika', label: 'Cuci + setrika' }, { key: 'setrika_saja', label: 'Setrika saja' },
];
const speeds: { key: 'reguler' | 'express' | 'kilat'; label: string }[] = [
  { key: 'reguler', label: 'Reguler · 2–3 hari' }, { key: 'express', label: 'Express · 1 hari' }, { key: 'kilat', label: 'Kilat · 6 jam' },
];

export function AdminPricingPage() {
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<PricingFormValues>({ defaultValues: PRICING });
  useEffect(() => {
    void pricingSettingsService.get().then(reset).catch((error: unknown) => {
      setLoadError(error instanceof Error ? error.message : 'Pengaturan harga gagal dimuat.');
    }).finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: PricingFormValues) {
    setSaveMessage(''); setSaveError('');
    const result = pricingSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const name = issue.path.join('.') as keyof PricingFormValues;
        setError(name, { message: issue.message });
      }
      return;
    }
    try {
      await pricingSettingsService.save(result.data);
      setSaveMessage('Pengaturan harga berhasil disimpan. Harga ini berlaku untuk pesanan baru.');
    } catch {
      setSaveError('Pengaturan harga gagal disimpan. Periksa penyimpanan browser Anda.');
    }
  }

  if (loading) return <p role="status" className="text-sm text-muted">Memuat pengaturan harga...</p>;
  if (loadError) return <p role="alert" className="rounded-token bg-red-50 p-4 text-sm text-red-700">{loadError}</p>;

  return <div className="mx-auto max-w-[1000px] space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-wider text-ocean">Konfigurasi</p><h1 className="mt-2 font-heading text-2xl font-extrabold text-ink">Pengaturan harga</h1><p className="mt-1 text-sm text-muted">Atur harga layanan dan biaya penjemputan.</p></header>
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="space-y-5">
      <Card className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="font-mono text-xs uppercase text-muted"><tr><th className="px-3 py-3">Layanan</th>{speeds.map((speed) => <th key={speed.key} className="px-3 py-3">{speed.label}</th>)}</tr></thead><tbody className="divide-y divide-line">{services.map((service) => <tr key={service.key}><th className="px-3 py-4 font-semibold">{service.label}</th>{speeds.map((speed) => {
        const name = `services.${service.key}.prices.${speed.key}` as const;
        const error = errors.services?.[service.key]?.prices?.[speed.key]?.message;
        return <td key={speed.key} className="px-3 py-3"><label className="block text-xs text-muted" htmlFor={name}>{`Rp/kg (${speed.key})`}</label><input id={name} type="number" min="0" step="500" className={`mt-1 w-full rounded-token border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ocean ${error ? 'border-red-500' : 'border-line'}`} {...register(name, { valueAsNumber: true })} />{error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}</td>;
      })}</tr>)}</tbody></table></Card>
      <div className="grid gap-4 md:grid-cols-2"><Card><h2 className="mb-4 font-heading font-bold">Minimal order</h2><Input label="Berat minimal (kg)" type="number" min="0.5" step="0.5" error={errors.minimumWeightKg?.message} {...register('minimumWeightKg', { valueAsNumber: true })} /></Card><Card><h2 className="mb-4 font-heading font-bold">Biaya jemput</h2><div className="space-y-4"><Input label="Jarak gratis (km)" type="number" min="0" step="0.5" error={errors.pickup?.freeWithinKm?.message} {...register('pickup.freeWithinKm', { valueAsNumber: true })} /><Input label="Biaya per km (Rp)" type="number" min="0" step="500" error={errors.pickup?.pricePerKm?.message} {...register('pickup.pricePerKm', { valueAsNumber: true })} /></div></Card></div>
      {saveMessage && <p role="status" className="rounded-token bg-status-successBg p-3 text-sm text-status-success">{saveMessage}</p>}{saveError && <p role="alert" className="rounded-token bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan pengaturan'}</Button>
    </form>
  </div>;
}
