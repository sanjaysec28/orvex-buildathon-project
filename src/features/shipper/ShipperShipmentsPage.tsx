import { Loader2, MapPin, Package, Plus } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  createDemoShipperShipment,
  fetchShipperDashboard,
} from '../../services/transporter/transporterDashboardService';
import type { ShipperDashboardOverview } from '../transporterDashboard/transporterDashboardTypes';
import { formatInr } from '../transporterDashboard/transporterDashboardUtils';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

export function ShipperShipmentsPage() {
  const { session } = useShipperSession();
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

  return (
    <ShipperWorkspaceShell pageTitle={session.isDemo ? 'Sample Shipments' : 'Shipments'}>
      <div className="space-y-4">
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
          <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
            <span>{session.isDemo ? 'Sample Shipments & Quotes' : 'Shipments'}</span>
          </h2>
          {loading ? (
            <p className="text-sm text-[#4A6578]">Loading shipments...</p>
          ) : !overview || overview.shipments.length === 0 ? (
            <p className="text-sm text-[#4A6578]">No shipments found.</p>
          ) : (
            <div className="space-y-2.5">
              {overview.shipments.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#18364B]">
                      <MapPin className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
                      <span>
                        {s.originCity}, {s.originState} → {s.destinationCity}, {s.destinationState}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A6578] mt-1">
                      {s.cargoType} · {s.weightTonnes} Tonnes · {s.requiredVehicleSpec} · {s.pickupDateLabel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-[#18364B]">
                      {formatInr(s.estimatedBudgetInr)}
                    </p>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#EAF5FD] border border-[#CBE4F6] text-[11px] font-bold text-[#18364B]">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ShipperWorkspaceShell>
  );
}
