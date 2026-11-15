import { Loader2, MapPin, Package, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  createDemoShipperShipment,
  fetchShipperDashboard,
} from '../../services/transporter/transporterDashboardService';
import { cn } from '../../utils/cn';
import type { ShipperDashboardOverview } from '../transporterDashboard/transporterDashboardTypes';
import { formatInr } from '../transporterDashboard/transporterDashboardUtils';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperCargoThumb } from './ShipperScenicArt';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

export function ShipperShipmentsPage() {
  const { session } = useShipperSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');

  const [overview, setOverview] = useState<ShipperDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [originCity, setOriginCity] = useState('Chennai');
  const [destinationCity, setDestinationCity] = useState('Bengaluru');
  const [cargoType, setCargoType] = useState('Industrial Spare Parts');
  const [weightTonnes, setWeightTonnes] = useState('7');
  const [vehicleSpec, setVehicleSpec] = useState('17 ft · Closed Body');
  const [budgetInr, setBudgetInr] = useState('68000');

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchShipperDashboard();
    if (res.ok) {
      setOverview(res.data.overview);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateShipment = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !session.isDemo) return;
    setSubmitting(true);
    setFeedback(null);
    const res = await createDemoShipperShipment({
      originCity,
      destinationCity,
      cargoType,
      weightTonnes: Number(weightTonnes) || 7,
      requiredVehicleSpec: vehicleSpec,
      estimatedBudgetInr: Number(budgetInr) || 65000,
    });
    if (res.ok) {
      setFeedback('Sample shipment added to your isolated demo shipper workspace.');
      await loadData();
    } else {
      setFeedback(res.message);
    }
    setSubmitting(false);
  };

  const selectedShipment =
    overview?.shipments.find((s) => s.id === selectedId) ?? null;

  return (
    <ShipperWorkspaceShell pageTitle={session.isDemo ? 'My Shipments' : 'Shipments'}>
      <div className="space-y-4">
        {selectedShipment ? (
          <section
            aria-label="Selected shipment details"
            className="rounded-[20px] bg-white border border-[#8BC9F0] p-4 sm:p-5 space-y-3 shadow-[0_6px_18px_-6px_rgba(21,112,239,0.14)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShipperCargoThumb />
                <div>
                  <p className="text-xs font-bold text-[#1570EF]">Shipment Details</p>
                  <h2 className="text-lg font-extrabold text-[#18364B]">{selectedShipment.id}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                aria-label="Close shipment details"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A6578] hover:bg-[#EAF4FB] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <p className="text-[#5A7486] font-semibold">Route</p>
                <p className="text-sm font-bold text-[#18364B] mt-0.5">
                  {selectedShipment.originCity}, {selectedShipment.originState} →{' '}
                  {selectedShipment.destinationCity}, {selectedShipment.destinationState}
                </p>
              </div>
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <p className="text-[#5A7486] font-semibold">Cargo & Vehicle</p>
                <p className="text-sm font-bold text-[#18364B] mt-0.5">
                  {selectedShipment.cargoType} · {selectedShipment.weightTonnes}T ·{' '}
                  {selectedShipment.requiredVehicleSpec}
                </p>
              </div>
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <p className="text-[#5A7486] font-semibold">Status & Estimate</p>
                <p className="text-sm font-bold text-[#18364B] mt-0.5 tabular-nums">
                  {selectedShipment.status} · {formatInr(selectedShipment.estimatedBudgetInr)}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {session.isDemo ? (
          <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
            <h2 className="text-base font-extrabold text-[#18364B]">Post Sample Demo Shipment</h2>
            <form onSubmit={(e) => void handleCreateShipment(e)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
                <span>Origin City</span>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
                <span>Destination City</span>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
                <span>Cargo Type</span>
                <input
                  type="text"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
                <span>Weight (Tonnes)</span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weightTonnes}
                  onChange={(e) => setWeightTonnes(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                />
              </label>
              <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
                <span>Vehicle Specification</span>
                <input
                  type="text"
                  value={vehicleSpec}
                  onChange={(e) => setVehicleSpec(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                />
              </label>
              <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
                <span>Est. Budget (INR)</span>
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  value={budgetInr}
                  onChange={(e) => setBudgetInr(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                />
              </label>
              <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-1">
                {feedback ? (
                  <p className="text-xs font-semibold text-[#286B14]">{feedback}</p>
                ) : (
                  <span className="text-xs text-[#5A7486]">
                    Saved only in the temporary demo shipper store.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>Add Sample Shipment</span>
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
              <span>{session.isDemo ? 'Sample Shipments & Quotes' : 'My Shipments'}</span>
            </h2>
            <Link
              to="/shipper/post"
              className="h-8 px-3.5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Post Shipment</span>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-[#4A6578]">Loading shipments...</p>
          ) : !overview || overview.shipments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#CBE0EE] bg-[#F7FBFE] p-6 text-center space-y-2">
              <p className="text-sm font-bold text-[#18364B]">No shipments yet.</p>
              <p className="text-xs text-[#4A6578]">
                Start by posting your first shipment and discover suitable transporters.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overview.shipments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSearchParams({ id: s.id })}
                  className={cn(
                    'w-full text-left rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors cursor-pointer',
                    selectedId === s.id
                      ? 'border-[#1570EF] bg-[#EFF7FE]'
                      : 'border-[#DCEAF4] bg-[#FCFDFE] hover:border-[#8BC9F0]',
                  )}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#18364B]">
                      <MapPin className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
                      <span>
                        {s.id} · {s.originCity}, {s.originState} → {s.destinationCity}, {s.destinationState}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A6578] mt-1">
                      {s.cargoType} · {s.weightTonnes} Tonnes · {s.requiredVehicleSpec} · {s.pickupDateLabel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-[#18364B] tabular-nums">
                      {formatInr(s.estimatedBudgetInr)}
                    </p>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#EAF5FD] border border-[#CBE4F6] text-[11px] font-bold text-[#18364B]">
                      {s.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </ShipperWorkspaceShell>
  );
}
