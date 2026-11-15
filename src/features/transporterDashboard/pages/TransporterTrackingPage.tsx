import { Info, MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { googleMapsContract } from '../../../services/maps/mapsContract';
import { fetchTransporterTrips } from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { TransporterTrip } from '../transporterDashboardTypes';

export function TransporterTrackingPage() {
  const [activeTrips, setActiveTrips] = useState<TransporterTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchTransporterTrips().then((res) => {
      if (!active) return;
      if (res.ok) {
        setActiveTrips(res.data.trips.filter((t) => t.status !== 'Completed'));
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const primaryCorridor = googleMapsContract.getPrimaryCorridor();

  return (
    <TransporterDashboardShell pageTitle="Live Tracking">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#18364B]">Live Corridor Tracking</h2>
            <span className="px-3 py-1 rounded-full bg-[#EAF5FD] text-[#1570EF] text-xs font-bold">
              {primaryCorridor.corridorCode} · {primaryCorridor.approximateDistanceKm} km
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A6578]">
            Monitor active haul corridors along {primaryCorridor.originCity} ↔ {primaryCorridor.destinationCity}.
          </p>
        </div>

        {!googleMapsContract.isConnected ? (
          <div className="rounded-[20px] bg-[#EEF7FD] border border-[#CBE0EE] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#355368]">
            <Info className="w-5 h-5 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-[#18364B]">
                Live GPS Map Telemetry Awaiting Google Maps Integration
              </p>
              <p className="mt-0.5">
                Interactive map pins and turn-by-turn vehicle telemetry will display automatically once the Google Maps Platform API integration is connected. Active corridor trip schedules are shown below without fabricated GPS coordinates.
              </p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Checking active corridor trips...
          </div>
        ) : activeTrips.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
            <Navigation className="w-9 h-9 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No vehicles currently in transit.</h3>
            <p className="text-sm text-[#4A6578]">
              Once a booked trip moves into transit, its route schedule and ETA appear here.
            </p>
            <Link
              to="/transporter/trips"
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-[#C8F542] text-[#18364B] text-xs font-bold"
            >
              Go to My Trips
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTrips.map((trip) => (
              <div
                key={trip.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[15px] font-extrabold text-[#18364B]">
                    <MapPin className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
                    <span>
                      {trip.vehicleReg}: {trip.originCity} → {trip.destinationCity}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A6578]">
                    Driver: {trip.driverName} · Scheduled ETA: {trip.etaLabel}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#DDF0FD] text-[#1570EF] text-xs font-bold self-start">
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
