import { AlertCircle, MapPin, Plus, Truck, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addTransporterVehicle,
  fetchTransporterVehicles,
} from '../../../services/transporter/transporterDashboardService';
import { cn } from '../../../utils/cn';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import { OrvexTruckCutout } from '../components/TransporterScenicArt';
import type {
  TransporterVehicle,
  VehicleAvailabilityStatus,
  VehicleCategory,
  VehicleLengthOption,
} from '../transporterDashboardTypes';
import {
  isValidRegistrationNumber,
  normalizeRegistrationNumber,
} from '../transporterDashboardUtils';

const CATEGORIES: readonly VehicleCategory[] = [
  'Closed Body',
  'Open Body',
  'Container',
  'Trailer',
  'Refrigerated',
];
const LENGTHS: readonly VehicleLengthOption[] = ['14 ft', '17 ft', '20 ft', '32 ft'];

export function TransporterVehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<TransporterVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('action') === 'add');

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('Closed Body');
  const [lengthFt, setLengthFt] = useState<VehicleLengthOption>('17 ft');
  const [capacityTonnes, setCapacityTonnes] = useState('8');
  const [currentCity, setCurrentCity] = useState('Chennai');
  const [availabilityStatus, setAvailabilityStatus] =
    useState<VehicleAvailabilityStatus>('Available');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    const res = await fetchTransporterVehicles();
    if (res.ok) {
      setVehicles(res.data.vehicles);
      setError(null);
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  const closeForm = () => {
    setShowAddForm(false);
    setFormError(null);
    if (searchParams.has('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!isValidRegistrationNumber(registrationNumber)) {
      setFormError('Enter a valid registration number (e.g., TN 02 AB 4567).');
      return;
    }
    const cap = Number(capacityTonnes);
    if (!Number.isFinite(cap) || cap <= 0) {
      setFormError('Enter a valid payload capacity in tonnes.');
      return;
    }

    setSubmitting(true);
    const res = await addTransporterVehicle({
      registrationNumber: normalizeRegistrationNumber(registrationNumber),
      vehicleCategory,
      lengthFt,
      capacityTonnes: cap,
      currentCity: currentCity.trim() || 'Chennai',
      availabilityStatus,
    });
    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.message);
      return;
    }

    setVehicles((prev) => [res.data.vehicle, ...prev]);
    setRegistrationNumber('');
    closeForm();
  };

  return (
    <TransporterDashboardShell pageTitle="My Vehicles">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#18364B]">Fleet Vehicles ({vehicles.length})</h2>
            <p className="text-xs sm:text-sm text-[#4A6578]">
              Register and manage trucks for load matching across Chennai ↔ Bengaluru and regional corridors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {showAddForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-[20px] bg-white border-2 border-[#73CFFF] p-4 sm:p-5 space-y-4 shadow-[0_10px_28px_-10px_rgba(24,54,75,0.14)]"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-[#18364B]">Add New Fleet Vehicle</h3>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close Add Vehicle form"
                className="w-8 h-8 rounded-full hover:bg-[#EAF4FB] flex items-center justify-center text-[#4A6578] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError ? (
              <div className="rounded-xl bg-[#FEF3F2] border border-[#F5B5B5] px-3.5 py-2.5 text-xs font-semibold text-[#B42318] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Registration Number</span>
                <input
                  type="text"
                  required
                  placeholder="TN 02 AB 4567"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] focus:outline-none focus:border-[#1570EF]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Vehicle Body Type</span>
                <select
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                  className="w-full h-11 px-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] focus:outline-none focus:border-[#1570EF]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Truck Length</span>
                <select
                  value={lengthFt}
                  onChange={(e) => setLengthFt(e.target.value as VehicleLengthOption)}
                  className="w-full h-11 px-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] focus:outline-none focus:border-[#1570EF]"
                >
                  {LENGTHS.map((len) => (
                    <option key={len} value={len}>
                      {len}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Payload Capacity (Tonnes)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  step="0.5"
                  required
                  value={capacityTonnes}
                  onChange={(e) => setCapacityTonnes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] focus:outline-none focus:border-[#1570EF]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Current City</span>
                <input
                  type="text"
                  required
                  placeholder="Chennai"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] focus:outline-none focus:border-[#1570EF]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Initial Availability</span>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value as VehicleAvailabilityStatus)}
                  className="w-full h-11 px-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B] focus:outline-none focus:border-[#1570EF]"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="On Trip">On Trip</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={closeForm}
                className="h-10 px-5 rounded-full border border-[#DCEAF4] text-sm font-bold text-[#3F5B6E] hover:bg-[#F3F9FD] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 rounded-full bg-[#C8F542] hover:bg-[#BCE934] disabled:opacity-60 text-[#18364B] text-sm font-bold cursor-pointer"
              >
                {submitting ? 'Saving Vehicle...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading fleet vehicles...
          </div>
        ) : error ? (
          <div className="rounded-[20px] bg-white border border-[#F5B5B5] p-6 text-center text-sm text-[#B42318]">
            {error}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
            <Truck className="w-9 h-9 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No vehicles added yet.</h3>
            <p className="text-sm text-[#4A6578] max-w-md mx-auto">
              Add your first truck to appear in Vehicle Availability and start receiving load matches.
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Your First Vehicle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {vehicles.map((v) => (
              <article
                key={v.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 shadow-[0_3px_12px_-4px_rgba(24,54,75,0.06)] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-11 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] p-1 flex items-center justify-center shrink-0">
                      <OrvexTruckCutout alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-extrabold text-[#18364B] truncate">
                        {v.registrationNumber}
                      </h3>
                      <p className="text-xs text-[#4A6578]">
                        {v.lengthFt} · {v.vehicleCategory} · {v.capacityTonnes}T
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border shrink-0',
                      v.availabilityStatus === 'Available'
                        ? 'bg-[#E7F8D8] text-[#286B14] border-[#C5ECAA]'
                        : v.availabilityStatus === 'On Trip'
                          ? 'bg-[#DDF0FD] text-[#1570EF] border-[#B6DDF9]'
                          : 'bg-[#EFF5F9] text-[#4A6578] border-[#D6E4EE]',
                    )}
                  >
                    {v.availabilityStatus}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EDF5FA] flex items-center justify-between text-xs text-[#4A6578]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1570EF]" aria-hidden="true" />
                    <span>{v.currentCity}</span>
                  </span>
                  {v.currentRoute ? (
                    <span className="font-semibold text-[#18364B]">
                      {v.currentRoute.origin} → {v.currentRoute.destination}
                    </span>
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
