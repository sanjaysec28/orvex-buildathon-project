import { AlertCircle, Phone, Plus, ShieldCheck, UserCheck, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addTransporterDriver,
  fetchTransporterDrivers,
} from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { TransporterDriver } from '../transporterDashboardTypes';

export function TransporterDriversPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drivers, setDrivers] = useState<TransporterDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('action') === 'add');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceExpiry, setLicenceExpiry] = useState('2030-06-30');
  const [licenceCategory, setLicenceCategory] = useState('HMV / Transport');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    const res = await fetchTransporterDrivers();
    if (res.ok) setDrivers(res.data.drivers);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

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
    setSubmitting(true);
    const res = await addTransporterDriver({
      fullName,
      mobileNumber,
      licenceNumber,
      licenceExpiry,
      licenceCategory,
    });
    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    setDrivers((prev) => [res.data.driver, ...prev]);
    setFullName('');
    setMobileNumber('');
    setLicenceNumber('');
    closeForm();
  };

  return (
    <TransporterDashboardShell pageTitle="My Drivers">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#18364B]">Drivers ({drivers.length})</h2>
            <p className="text-xs sm:text-sm text-[#4A6578]">
              Manage verified drivers and commercial HMV licences assigned to your fleet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Driver</span>
          </button>
        </div>

        {showAddForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-[20px] bg-white border-2 border-[#73CFFF] p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#18364B]">Add Driver</h3>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close Add Driver form"
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
                <span>Driver Full Name</span>
                <input
                  type="text"
                  required
                  placeholder="Karthik S"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Mobile Number</span>
                <input
                  type="tel"
                  required
                  placeholder="9876501234"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Driving Licence Number</span>
                <input
                  type="text"
                  required
                  placeholder="TN0220190012345"
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Licence Expiry</span>
                <input
                  type="date"
                  required
                  value={licenceExpiry}
                  onChange={(e) => setLicenceExpiry(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                />
              </label>

              <label className="space-y-1 text-xs font-bold text-[#18364B]">
                <span>Licence Category</span>
                <select
                  value={licenceCategory}
                  onChange={(e) => setLicenceCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
                >
                  <option value="HMV / Transport">HMV / Transport</option>
                  <option value="LMV-TR">LMV-TR</option>
                  <option value="Trailer / Heavy">Trailer / Heavy</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={closeForm}
                className="h-10 px-5 rounded-full border border-[#DCEAF4] text-sm font-bold text-[#3F5B6E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold cursor-pointer"
              >
                {submitting ? 'Saving Driver...' : 'Save Driver'}
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading drivers...
          </div>
        ) : drivers.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
            <UserCheck className="w-9 h-9 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No additional drivers added yet.</h3>
            <p className="text-sm text-[#4A6578] max-w-md mx-auto">
              Add verified drivers to assign them across your trucks and active corridor trips.
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add First Driver</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {drivers.map((driver) => (
              <article
                key={driver.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 space-y-2.5 shadow-[0_3px_12px_-4px_rgba(24,54,75,0.06)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-extrabold text-[#18364B]">{driver.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E7F8D8] text-[#286B14] border border-[#C5ECAA] text-[11px] font-bold">
                    {driver.status}
                  </span>
                </div>
                <p className="text-xs text-[#4A6578] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#1570EF]" aria-hidden="true" />
                  <span>{driver.mobileNumber}</span>
                </p>
                <p className="text-xs font-mono text-[#18364B] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#286B14]" aria-hidden="true" />
                  <span>
                    {driver.licenceNumber} ({driver.licenceCategory})
                  </span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
