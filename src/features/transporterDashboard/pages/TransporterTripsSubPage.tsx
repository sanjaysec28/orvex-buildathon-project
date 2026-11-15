import { ArrowRight, CheckCircle2, MapPin, Route } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createOrCompleteTrip,
  fetchTransporterTrips,
} from '../../../services/transporter/transporterDashboardService';
import { cn } from '../../../utils/cn';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { TransporterTrip } from '../transporterDashboardTypes';
import { formatInr } from '../transporterDashboardUtils';

export function TransporterTripsSubPage() {
  const [trips, setTrips] = useState<TransporterTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    const res = await fetchTransporterTrips();
    if (res.ok) setTrips(res.data.trips);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  const handleMarkCompleted = async (tripId: string) => {
    setCompletingId(tripId);
    const res = await createOrCompleteTrip({ action: 'complete', tripId });
    setCompletingId(null);
    if (res.ok) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? res.data.trip : t)));
    }
  };

  return (
    <TransporterDashboardShell pageTitle="My Trips">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#18364B]">Active &amp; Completed Trips ({trips.length})</h2>
            <p className="text-xs sm:text-sm text-[#4A6578]">
              Track live haul statuses, plan return loads from destination hubs, and finalize trip payouts.
            </p>
          </div>
          <Link
            to="/transporter/loads?mode=return"
            className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Find Return Loads</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
            <Route className="w-9 h-9 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No active or completed trips yet.</h3>
            <p className="text-sm text-[#4A6578] max-w-md mx-auto">
              Discover available loads and submit offers to book your first corridor trip on ORVEX.
            </p>
            <Link
              to="/transporter/loads"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold"
            >
              <span>Discover Loads</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <article
                key={trip.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 space-y-3 shadow-[0_3px_12px_-4px_rgba(24,54,75,0.06)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold text-[#18364B]">
                    <MapPin className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
                    <span>
                      {trip.originCity}, {trip.originState}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#5A7486]" aria-hidden="true" />
                    <MapPin className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                    <span>
                      {trip.destinationCity}, {trip.destinationState}
                    </span>
                  </div>

                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold border self-start',
                      trip.status === 'Completed'
                        ? 'bg-[#E7F8D8] text-[#286B14] border-[#C5ECAA]'
                        : 'bg-[#DDF0FD] text-[#1570EF] border-[#B6DDF9]',
                    )}
                  >
                    {trip.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EFF6FA] text-xs text-[#4A6578]">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-bold text-[#18364B]">{trip.vehicleReg}</span>
                    <span>Driver: {trip.driverName}</span>
                    <span>
                      {trip.cargoType} · {trip.weightTonnes}T
                    </span>
                    <span>Freight: {formatInr(trip.freightInr)}</span>
                    {trip.status !== 'Completed' ? <span>ETA: {trip.etaLabel}</span> : null}
                  </div>

                  {trip.status !== 'Completed' ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/transporter/loads?mode=return&origin=${encodeURIComponent(trip.destinationCity)}`}
                        className="h-9 px-4 rounded-full bg-[#EDF6FC] hover:bg-[#DCEEFB] text-[#1570EF] font-bold inline-flex items-center gap-1"
                      >
                        <span>Find Return Load</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        disabled={completingId === trip.id}
                        onClick={() => void handleMarkCompleted(trip.id)}
                        className="h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{completingId === trip.id ? 'Completing...' : 'Mark Completed'}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
