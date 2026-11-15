import { ArrowLeft, Loader2, MapPin, PackagePlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createDemoShipperShipment } from '../../services/transporter/transporterDashboardService';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

export function ShipperPostShipmentPage() {
  const { session } = useShipperSession();
  const navigate = useNavigate();

  const [originCity, setOriginCity] = useState('Chennai');
  const [destinationCity, setDestinationCity] = useState('Bengaluru');
  const [cargoType, setCargoType] = useState('Textile Goods');
  const [weightTonnes, setWeightTonnes] = useState('8');
  const [vehicleSpec, setVehicleSpec] = useState('17 ft · Closed Body');
  const [budgetInr, setBudgetInr] = useState('72000');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);

    const res = await createDemoShipperShipment({
      originCity,
      destinationCity,
      cargoType,
      weightTonnes: Number(weightTonnes) || 8,
      requiredVehicleSpec: vehicleSpec,
      estimatedBudgetInr: Number(budgetInr) || 68000,
    });

    if (res.ok) {
      navigate(`/shipper/shipments?id=${encodeURIComponent(res.data.shipment.id)}`);
      return;
    }

    setFeedback({ type: 'err', text: res.message });
    setSubmitting(false);
  };

  return (
    <ShipperWorkspaceShell pageTitle="Post a Shipment">
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/shipper"
            className="text-xs font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Shipper Dashboard</span>
          </Link>
        </div>

        <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 sm:p-6 space-y-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#EEF8FE] border border-[#DCEAF4] flex items-center justify-center shrink-0">
              <PackagePlus className="w-5 h-5 text-[#18364B]" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#18364B]">
                {session.isDemo ? 'Post a Sample Shipment' : 'Create New Shipment Requirement'}
              </h2>
              <p className="text-xs text-[#4A6578]">
                Specify pickup, destination, cargo details, and preferred truck configuration.
              </p>
            </div>
          </div>

          {!session.isDemo ? (
            <div className="rounded-2xl border border-[#F4DB88] bg-[#FFF8E6] p-4 text-xs text-[#6B4A00] leading-relaxed">
              Live shipment dispatch is not connected in this environment yet. Submitting this form will report the server status without creating fake shipments.
            </div>
          ) : null}

          <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
              <span>Pickup City</span>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-[#5A7486] absolute start-3 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full h-10 ps-9 pe-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                  required
                />
              </div>
            </label>

            <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
              <span>Delivery City</span>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-[#5A7486] absolute start-3 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full h-10 ps-9 pe-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B]"
                  required
                />
              </div>
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
                max={45}
                value={weightTonnes}
                onChange={(e) => setWeightTonnes(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B] tabular-nums"
              />
            </label>

            <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
              <span>Preferred Vehicle Type</span>
              <select
                value={vehicleSpec}
                onChange={(e) => setVehicleSpec(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B] bg-white"
              >
                <option value="14 ft · Open Body">14 ft · Open Body</option>
                <option value="17 ft · Closed Body">17 ft · Closed Body</option>
                <option value="20 ft · Closed Body">20 ft · Closed Body</option>
                <option value="32 ft · Trailer">32 ft · Trailer</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-[#3F5B6E] space-y-1">
              <span>Target Freight Budget (INR)</span>
              <input
                type="number"
                min={1000}
                step={500}
                value={budgetInr}
                onChange={(e) => setBudgetInr(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCEAF4] text-sm text-[#18364B] tabular-nums"
              />
            </label>

            {feedback ? (
              <div
                role="alert"
                className="sm:col-span-2 rounded-xl border border-[#F5B5B5] bg-[#FEF3F2] px-3.5 py-2.5 text-xs font-semibold text-[#B42318]"
              >
                {feedback.text}
              </div>
            ) : null}

            <div className="sm:col-span-2 flex items-center justify-end gap-2.5 pt-2">
              <Link
                to="/shipper/shipments"
                className="h-10 px-4 rounded-full border border-[#DCEAF4] text-xs font-bold text-[#18364B] inline-flex items-center hover:bg-[#F3F9FE]"
              >
                View My Shipments
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
                <span>Publish Shipment</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </ShipperWorkspaceShell>
  );
}
