import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Truck,
  Weight,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchLoadById,
  fetchTransporterVehicles,
  submitLoadOffer,
} from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { LoadOpportunity, TransporterVehicle } from '../transporterDashboardTypes';
import { formatInr } from '../transporterDashboardUtils';

export function TransporterLoadDetailPage() {
  const { loadId = '' } = useParams<{ loadId: string }>();
  const navigate = useNavigate();

  const [load, setLoad] = useState<LoadOpportunity | null>(null);
  const [fleetVehicles, setFleetVehicles] = useState<TransporterVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [proposedFreightInr, setProposedFreightInr] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([fetchLoadById(loadId), fetchTransporterVehicles()]).then(
      ([loadRes, vehRes]) => {
        if (!active) return;
        if (!loadRes.ok) {
          setError(loadRes.message);
          setLoading(false);
          return;
        }
        setLoad(loadRes.data.load);
        if (loadRes.data.load.expectedFreightInr) {
          setProposedFreightInr(String(loadRes.data.load.expectedFreightInr));
        }
        const vehicles =
          loadRes.data.compatibleVehicles.length > 0
            ? loadRes.data.compatibleVehicles
            : vehRes.ok
              ? vehRes.data.vehicles
              : [];
        setFleetVehicles(vehicles);
        if (vehicles[0]) {
          setSelectedVehicleId(vehicles[0].id);
        }
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [loadId]);

  const handleSubmitOffer = async (event: FormEvent) => {
    event.preventDefault();
    if (!load) return;
    setSubmitError(null);
    setSubmitting(true);
    const res = await submitLoadOffer({
      loadId: load.id,
      vehicleId: selectedVehicleId,
      proposedFreightInr: Number(proposedFreightInr),
      notes,
    });
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.message);
      return;
    }
    setSubmittedSuccess(true);
  };

  return (
    <TransporterDashboardShell pageTitle="Load Details">
      <div className="space-y-4 max-w-4xl">
        <Link
          to="/transporter/loads"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1570EF] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Load Discovery</span>
        </Link>

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading load opportunity...
          </div>
        ) : error || !load ? (
          <div className="rounded-[20px] bg-white border border-[#F5B5B5] p-6 text-center text-sm text-[#B42318]">
            {error ?? 'Load not found.'}
          </div>
        ) : (
          <>
            <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-[#18364B]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-[#DC2626]" aria-hidden="true" />
                    <span>
                      {load.originCity}, {load.originState}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#5A7486]" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
                    <span>
                      {load.destinationCity}, {load.destinationState}
                    </span>
                  </span>
                </div>

                {load.expectedFreightInr !== null ? (
                  <div className="sm:text-right">
                    <p className="text-2xl font-extrabold text-[#18364B]">
                      {formatInr(load.expectedFreightInr)}
                    </p>
                    <p className="text-xs text-[#5A7486]">Expected Freight</p>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#EFF6FA] text-xs">
                <div className="rounded-xl bg-[#F7FBFE] p-3">
                  <p className="text-[#5A7486]">Cargo Type</p>
                  <p className="font-bold text-[#18364B] mt-0.5 inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{load.cargoType}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7FBFE] p-3">
                  <p className="text-[#5A7486]">Vehicle Spec</p>
                  <p className="font-bold text-[#18364B] mt-0.5 inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{load.requiredLengthFt}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7FBFE] p-3">
                  <p className="text-[#5A7486]">Weight</p>
                  <p className="font-bold text-[#18364B] mt-0.5 inline-flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{load.weightTonnes} Tonnes</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7FBFE] p-3">
                  <p className="text-[#5A7486]">Distance & Pickup</p>
                  <p className="font-bold text-[#18364B] mt-0.5">
                    {load.distanceKm} km · {load.pickupWindowLabel}
                  </p>
                </div>
              </div>
            </section>

            {/* Submit Offer Form */}
            <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 space-y-4">
              <h2 className="text-base font-extrabold text-[#18364B]">Submit Freight Offer</h2>

              {submittedSuccess || load.offerSubmitted ? (
                <div className="rounded-2xl bg-[#E7F8D8] border border-[#B7EC42] p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#18364B] text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#286B14]" aria-hidden="true" />
                    <span>Offer Submitted Successfully</span>
                  </div>
                  <p className="text-xs text-[#355368]">
                    Your quote for {load.originCity} → {load.destinationCity} has been logged under Offers &amp; Negotiations.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/transporter/offers')}
                    className="h-9 px-4 rounded-full bg-[#18364B] text-white text-xs font-bold cursor-pointer"
                  >
                    View Offers &amp; Negotiations
                  </button>
                </div>
              ) : fleetVehicles.length === 0 ? (
                <div className="rounded-2xl bg-[#FFF8E1] border border-[#F4DB88] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-[#5F4200]">
                    Add at least one fleet vehicle before submitting an offer for this load.
                  </p>
                  <Link
                    to="/transporter/vehicles?action=add"
                    className="h-9 px-4 rounded-full bg-[#C8F542] text-[#18364B] text-xs font-bold inline-flex items-center justify-center shrink-0"
                  >
                    Add Vehicle
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="space-y-3.5">
                  {submitError ? (
                    <div className="rounded-xl bg-[#FEF3F2] border border-[#F5B5B5] px-3.5 py-2.5 text-xs font-semibold text-[#B42318] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label className="space-y-1 text-xs font-bold text-[#18364B]">
                      <span>Select Fleet Vehicle</span>
                      <select
                        required
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                      >
                        {fleetVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.registrationNumber} ({v.lengthFt} · {v.vehicleCategory})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-xs font-bold text-[#18364B]">
                      <span>Proposed Freight Quote (INR ₹)</span>
                      <input
                        type="number"
                        min={1000}
                        required
                        value={proposedFreightInr}
                        onChange={(e) => setProposedFreightInr(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-xs font-bold text-[#18364B]">
                    <span>Dispatch Notes (Optional)</span>
                    <input
                      type="text"
                      placeholder="Available at origin hub with GPS & e-way bill ready"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-medium text-[#18364B]"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-6 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold cursor-pointer"
                  >
                    {submitting ? 'Submitting Offer...' : 'Submit Freight Offer'}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
