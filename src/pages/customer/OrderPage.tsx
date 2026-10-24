import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { LeafletMouseEvent } from 'leaflet';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { OUTLET_LOCATION } from '../../config/location';
import { PRICING, type LaundryService, type PricingConfig, type ServiceSpeed } from '../../config/pricing';
import { calculateDistanceKm } from '../../lib/distance';
import { formatRupiah, calculatePrice } from '../../lib/pricing';
import { createOrderSchema, type OrderFormValues } from '../../lib/orderValidation';
import { useAuth } from '../../services/AuthContext';
import { ordersService } from '../../services/orders';
import { pricingSettingsService } from '../../services/pricingSettings';
import '../../lib/leaflet';

interface PickupPoint { lat: number; lng: number }

function MapClickHandler({ onChoose }: { onChoose: (point: PickupPoint) => void }) {
  useMapEvents({ click(event: LeafletMouseEvent) { onChoose({ lat: event.latlng.lat, lng: event.latlng.lng }); } });
  return null;
}

function MapPanTo({ point }: { point: PickupPoint }) {
  const map = useMap();
  useEffect(() => { map.setView([point.lat, point.lng], Math.max(map.getZoom(), 14)); }, [map, point.lat, point.lng]);
  return null;
}

function DraggableMarker({ point, onChoose }: { point: PickupPoint; onChoose: (point: PickupPoint) => void }) {
  return <Marker position={[point.lat, point.lng]} draggable eventHandlers={{ dragend(event) {
    const marker = event.target;
    const location = marker.getLatLng();
    onChoose({ lat: location.lat, lng: location.lng });
  } }} />;
}

export function OrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pricing, setPricing] = useState<PricingConfig>(PRICING);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceLoadError, setPriceLoadError] = useState('');
  const [pickupPoint, setPickupPoint] = useState<PickupPoint>({ lat: OUTLET_LOCATION.lat, lng: OUTLET_LOCATION.lng });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, setError, clearErrors, watch, reset, formState: { errors } } = useForm<OrderFormValues>({
    defaultValues: { service: 'cuci_kering_lipat', speed: 'reguler', weightKg: pricing.minimumWeightKg, pickupAddress: '', latitude: OUTLET_LOCATION.lat, longitude: OUTLET_LOCATION.lng, notes: '' },
  });
  useEffect(() => {
    void pricingSettingsService.get().then((nextPricing) => {
      setPricing(nextPricing);
      reset({ service: 'cuci_kering_lipat', speed: 'reguler', weightKg: nextPricing.minimumWeightKg, pickupAddress: '', latitude: OUTLET_LOCATION.lat, longitude: OUTLET_LOCATION.lng, notes: '' });
    }).catch((error: unknown) => {
      setPriceLoadError(error instanceof Error ? error.message : 'Pengaturan harga gagal dimuat.');
    }).finally(() => setPriceLoading(false));
  }, [reset]);
  const service = watch('service');
  const speed = watch('speed');
  const weight = watch('weightKg');
  const address = watch('pickupAddress');
  const distanceKm = calculateDistanceKm(OUTLET_LOCATION, pickupPoint);
  let summary = { subtotal: 0, pickupFee: 0, total: 0 };
  let pricingError = '';
  try { summary = calculatePrice(service, speed, Number(weight), distanceKm, pricing); }
  catch (error) { pricingError = error instanceof Error ? error.message : 'Harga belum dapat dihitung.'; }

  function choosePoint(point: PickupPoint) {
    setPickupPoint(point);
    setValue('latitude', point.lat, { shouldValidate: true });
    setValue('longitude', point.lng, { shouldValidate: true });
    clearErrors(['latitude', 'longitude']);
    setLocationMessage('Titik jemput diperbarui. Silakan isi alamat lengkap.');
  }

  function useMyLocation() {
    setLocationMessage('');
    if (!navigator.geolocation) { setLocationMessage('Perangkat ini tidak mendukung akses lokasi. Pilih titik pada peta.'); return; }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition((position) => {
      choosePoint({ lat: position.coords.latitude, lng: position.coords.longitude });
      setLocationMessage('Lokasi berhasil digunakan. Lengkapi alamat jemput Anda.');
      setLoadingLocation(false);
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Izin lokasi ditolak. Anda tetap dapat memilih titik pada peta atau memasukkan alamat manual.'
        : error.code === error.POSITION_UNAVAILABLE ? 'Lokasi tidak tersedia. Pilih titik pada peta atau isi alamat manual.'
          : 'Permintaan lokasi terlalu lama. Silakan pilih titik pada peta.';
      setLocationMessage(message);
      setLoadingLocation(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  async function submitOrder(values: OrderFormValues) {
    setSubmitError('');
    clearErrors();
    const schema = createOrderSchema(pricing.minimumWeightKg, pricing.weightStepKg);
    const parsed = schema.safeParse({ ...values, latitude: pickupPoint.lat, longitude: pickupPoint.lng, weightKg: Number(values.weightKg) });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'service' || field === 'speed' || field === 'weightKg' || field === 'pickupAddress' || field === 'latitude' || field === 'longitude' || field === 'notes') {
          setError(field, { message: issue.message });
        }
      }
      return;
    }
    if (!user) { setSubmitError('Sesi login tidak ditemukan. Silakan masuk kembali.'); return; }
    setSubmitting(true);
    try {
      const totalPrice = calculatePrice(values.service, values.speed, parsed.data.weightKg, distanceKm, pricing);
      const order = await ordersService.create({
        customerId: user.id,
        service: values.service,
        speed: values.speed,
        weightKg: parsed.data.weightKg,
        pickupAddress: parsed.data.pickupAddress,
        pickupLocation: pickupPoint,
        distanceKm,
        notes: values.notes.trim() || undefined,
        subtotal: totalPrice.subtotal,
        pickupFee: totalPrice.pickupFee,
        total: totalPrice.total,
        status: 'menunggu_konfirmasi',
      });
      navigate(`/pesanan/${order.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Pesanan gagal disimpan. Silakan coba lagi.');
    } finally { setSubmitting(false); }
  }

  const serviceOptions: { id: LaundryService; label: string }[] = Object.entries(pricing.services).map(([id, detail]) => ({ id: id as LaundryService, label: detail.label }));
  const speedOptions: { id: ServiceSpeed; short: string; duration: string }[] = [
    { id: 'reguler', short: 'Reguler', duration: '2–3 hari' }, { id: 'express', short: 'Express', duration: '1 hari' }, { id: 'kilat', short: 'Kilat', duration: '6 jam' },
  ];

  if (priceLoading) return <main className="mx-auto max-w-2xl px-4 py-8"><p role="status" className="text-sm text-muted">Memuat pengaturan harga...</p></main>;
  if (priceLoadError) return <main className="mx-auto max-w-2xl px-4 py-8"><p role="alert" className="rounded-token bg-red-50 p-4 text-sm text-red-700">{priceLoadError}</p></main>;

  return <main className="mx-auto max-w-2xl px-4 pb-44 pt-7 sm:pb-12">
    <h1 className="font-heading text-2xl font-extrabold text-ink">Buat pesanan</h1>
    <form onSubmit={(event) => void handleSubmit(submitOrder)(event)} noValidate className="mt-5 space-y-4">
      <Select label="Pilih layanan" {...register('service')} error={errors.service?.message}>{serviceOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</Select>
      <fieldset><legend className="mb-2 text-sm font-semibold text-ink">Kecepatan layanan</legend><div className="grid grid-cols-3 gap-2">{speedOptions.map((option) => <label key={option.id} className={`relative cursor-pointer rounded-token border p-3 transition ${speed === option.id ? 'border-ocean bg-mist' : 'border-line bg-white'}`}><input className="sr-only" type="radio" value={option.id} {...register('speed')} /><span className="block text-sm font-bold text-ink">{option.short}</span><span className="mt-1 block text-[11px] text-muted">{option.duration}</span>{option.id === 'express' && <span className="mt-2 inline-block"><Badge>EXPRESS</Badge></span>}<span className="mt-2 block text-xs font-bold text-ocean">{formatRupiah(pricing.services[service].prices[option.id])}/kg</span></label>)}</div>{errors.speed?.message && <p role="alert" className="mt-1 text-xs text-red-600">{errors.speed.message}</p>}</fieldset>
      <Input label="Berat cucian · kg" type="number" min={pricing.minimumWeightKg} step={pricing.weightStepKg} error={errors.weightKg?.message} {...register('weightKg', { valueAsNumber: true })} />
      <label className="block space-y-2 text-sm font-semibold text-ink" htmlFor="notes"><span>Catatan untuk kami</span><textarea id="notes" rows={2} maxLength={500} placeholder="Contoh: pisahkan pakaian putih" className="w-full resize-y rounded-token border border-line bg-white px-4 py-3 font-normal outline-none focus:border-ocean" {...register('notes')} />{errors.notes?.message && <span role="alert" className="block font-normal text-red-600">{errors.notes.message}</span>}</label>
      <section><div className="mb-2"><h2 className="text-sm font-semibold text-ink">Titik jemput</h2><p className="mt-1 text-xs text-muted">Ketuk peta atau geser penanda untuk menentukan lokasi.</p></div><div className="h-52 overflow-hidden rounded-token border border-line"><MapContainer center={[OUTLET_LOCATION.lat, OUTLET_LOCATION.lng]} zoom={14} scrollWheelZoom={false} className="h-full w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapClickHandler onChoose={choosePoint} /><MapPanTo point={pickupPoint} /><DraggableMarker point={pickupPoint} onChoose={choosePoint} /></MapContainer></div><Button type="button" variant="outline" className="mt-2 px-3 py-2 text-xs" disabled={loadingLocation} onClick={useMyLocation}>{loadingLocation ? 'Mencari lokasi...' : '⌖ Gunakan lokasi saya'}</Button>{locationMessage && <p role="status" className="mt-2 text-xs text-muted">{locationMessage}</p>}<p className="mt-1 text-xs text-muted">Jarak dari outlet: {distanceKm.toFixed(1)} km</p></section>
      <Input label="Alamat jemput lengkap" placeholder="Jl. Melati No. 12, Bandung" value={address} error={errors.pickupAddress?.message} {...register('pickupAddress')} />
      <Card className="hidden sm:block"><PriceSummary summary={summary} pricingError={pricingError} /></Card>
      {submitError && <p role="alert" className="rounded-token bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">{submitting ? 'Menyimpan pesanan...' : 'Buat pesanan'}</Button>
    </form>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 p-4 shadow-[0_-6px_24px_rgba(20,52,59,0.08)] backdrop-blur sm:hidden"><div className="mx-auto max-w-2xl"><PriceSummary summary={summary} pricingError={pricingError} /></div></div>
  </main>;
}

function PriceSummary({ summary, pricingError }: { summary: { subtotal: number; pickupFee: number; total: number }; pricingError: string }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs"><span className="text-muted">Subtotal</span><span className="text-right font-semibold text-ink">{pricingError || formatRupiah(summary.subtotal)}</span><span className="text-muted">Biaya jemput</span><span className="text-right font-semibold text-ink">{pricingError ? '—' : summary.pickupFee ? formatRupiah(summary.pickupFee) : 'Gratis'}</span><span className="mt-1 font-bold uppercase tracking-wide text-ocean">Total</span><span className="mt-1 text-right font-heading text-base font-extrabold text-ocean">{pricingError ? '—' : formatRupiah(summary.total)}</span></div>;
}
