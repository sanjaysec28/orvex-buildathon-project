import { CalendarCheck2, CheckCircle2, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchTransporterVehicles,
  updateVehicleAvailability,
} from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type {
  TransporterVehicle,
  VehicleAvailabilityStatus,
} from '../transporterDashboardTypes';

export function TransporterAvailabilityPage() {
  const [vehicles, setVehicles] = useState<TransporterVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    const res = await fetchTransporterVehicles();
    if (res.ok) setVehicles(res.data.vehicles);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  const handleUpdate = async (
    vehicle: TransporterVehicle,
    status: VehicleAvailabilityStatus,
    city: string,
  ) => {
    setSavingId(vehicle.id);
    setSavedBanner(null);
    const res = await updateVehicleAvailability({
      vehicleId: vehicle.id,
      availabilityStatus: status,
      currentCity: city,
    });
    setSavingId(null);
    if (res.ok) {
      setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? res.data.vehicle : v)));
      setSavedBanner(`Updated ${vehicle.registrationNumber} to ${status} in ${city}.`);
    }
  };

  return (
    <TransporterDashboardShell pageTitle="Availability">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5">
          <h2 className="text-lg font-extrabold text-[#18364B]">Set Vehicle Availability</h2>
          <p className="text-xs sm:text-sm text-[#4A6578]">
            Keep vehicle availability and current hub city updated so ORVEX matches relevant outbound and return loads.
          </p>
        </div>

        {savedBanner ? (
          <div className="rounded-2xl bg-[#E7F8D8] border border-[#B7EC42] px-4 py-3 text-xs sm:text-sm font-bold text-[#18364B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#286B14] shrink-0" aria-hidden="true" />
            <span>{savedBanner}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading fleet availability...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
            <CalendarCheck2 className="w-9 h-9 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No vehicles available to schedule.</h3>
            <p className="text-sm text-[#4A6578]">Add a vehicle first before setting its availability.</p>
            <Link
              to="/transporter/vehicles?action=add"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold"
            >
              Add Vehicle
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <AvailabilityRow
                key={vehicle.id}
                vehicle={vehicle}
                saving={savingId === vehicle.id}
                onSave={(status, city) => void handleUpdate(vehicle, status, city)}
              />
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}

function AvailabilityRow({
  vehicle,
  saving,
  onSave,
}: {
  vehicle: TransporterVehicle;
  saving: boolean;
  onSave: (status: VehicleAvailabilityStatus, city: string) => void;
}) {
  const [status, setStatus] = useState<VehicleAvailabilityStatus>(vehicle.availabilityStatus);
  const [city, setCity] = useState(vehicle.currentCity);

  return (
    <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-extrabold text-[#18364B]">{vehicle.registrationNumber}</h3>
        <p className="text-xs text-[#4A6578]">
          {vehicle.lengthFt} · {vehicle.vehicleCategory} · {vehicle.capacityTonnes} Tonnes
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <label className="relative flex items-center">
          <MapPin className="w-4 h-4 text-[#1570EF] absolute left-3 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            aria-label={`Current city for ${vehicle.registrationNumber}`}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-10 pl-9 pr-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] w-full sm:w-44"
          />
        </label>

        <select
          aria-label={`Availability status for ${vehicle.registrationNumber}`}
          value={status}
          onChange={(e) => setStatus(e.target.value as VehicleAvailabilityStatus)}
          className="h-10 px-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
        >
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(status, city)}
          className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] disabled:opacity-60 text-[#18364B] text-sm font-bold cursor-pointer shrink-0"
        >
          {saving ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </div>
  );
}
