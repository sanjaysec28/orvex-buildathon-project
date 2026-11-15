import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  acceptDemoShipperOffer,
  fetchShipperDashboard,
} from '../../services/transporter/transporterDashboardService';
import { cn } from '../../utils/cn';
import type { ShipperDashboardOverview } from '../transporterDashboard/transporterDashboardTypes';
import { formatInr } from '../transporterDashboard/transporterDashboardUtils';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

export function ShipperHomePage() {
  const { session } = useShipperSession();
  const [overview, setOverview] = useState<ShipperDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await fetchShipperDashboard();
    if (!res.ok) {
      setErrorMessage(res.message);
      setLoading(false);
      return;
    }
    setOverview(res.data.overview);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleAcceptOffer = async (offerId: string) => {
    if (acceptingOfferId) return;
    setAcceptingOfferId(offerId);
    const res = await acceptDemoShipperOffer(offerId);
    if (res.ok) {
      setOverview(res.data.overview);
    }
    setAcceptingOfferId(null);
  };

  return (
    <ShipperWorkspaceShell pageTitle="Shipper Dashboard">
      {loading && !overview ? (
        <div className="space-y-4 animate-pulse" aria-busy="true">
          <div className="h-32 rounded-[20px] bg-[#E3F1FA]" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="h-20 rounded-[16px] bg-[#E3F1FA]" />
            <div className="h-20 rounded-[16px] bg-[#E9F6DC]" />
            <div className="h-20 rounded-[16px] bg-[#E3F1FA]" />
            <div className="h-20 rounded-[16px] bg-[#E9F6DC]" />
          </div>
        </div>
      ) : errorMessage && !overview ? (
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#B42318] mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-[#18364B]">Unable to Load Shipper Dashboard</h2>
          <p className="text-sm text-[#4A6578]">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="h-10 px-5 rounded-full bg-[#C8F542] text-[#18364B] font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      ) : overview ? (
        <div className="space-y-4">
          {/* Business Overview Banner */}
          <section className="rounded-[20px] bg-gradient-to-r from-[#E5F3FA] via-[#F6FBFF] to-[#EEF9D8] border border-[#CBE4F6] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8FA7B] border border-[#B7EC42] text-[#18364B] text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#228B22]" aria-hidden="true" />
                  <span>{overview.businessProfile.verificationStatus}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DCEAF4] text-[#18364B] text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-[#1570EF]" aria-hidden="true" />
                  <span>{overview.businessProfile.accountType}</span>
                </span>
              </div>
              <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#18364B] tracking-tight">
                {overview.businessProfile.businessName}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#3F5B6E]">
                Primary Hub: <span className="font-bold text-[#18364B]">{overview.businessProfile.primaryHub}</span> · Corridors:{' '}
                <span className="font-bold text-[#18364B]">{overview.businessProfile.corridors.join(', ')}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                to="/shipper/shipments"
                className="h-11 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Package className="w-4 h-4" aria-hidden="true" />
                <span>{session.isDemo ? 'Manage Sample Shipments' : 'Manage Shipments'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* KPI Summary */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <ShipperStatCard
              tone="blue"
              icon={<Package className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
              label={session.isDemo ? 'Sample Shipments' : 'Active Shipments'}
              value={String(overview.shipments.length)}
            />
            <ShipperStatCard
              tone="lime"
              icon={<Truck className="w-5 h-5 text-[#3B8700]" aria-hidden="true" />}
              label={session.isDemo ? 'Sample Transporters' : 'Matched Transporters'}
              value={String(overview.transporters.length)}
            />
            <ShipperStatCard
              tone="blue"
              icon={<ClipboardCheck className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
              label={session.isDemo ? 'Sample Offers' : 'Quotes Received'}
              value={String(overview.offers.length)}
            />
            <ShipperStatCard
              tone="lime"
              icon={<ShieldCheck className="w-5 h-5 text-[#3B8700]" aria-hidden="true" />}
              label={session.isDemo ? 'Sample Bookings' : 'Confirmed Bookings'}
              value={String(overview.bookings.length)}
            />
          </section>

          {/* Main 2-column Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* Sample Shipments */}
            <section className="xl:col-span-7 rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                  {session.isDemo ? 'Sample Shipments' : 'Your Shipments'}
                </h3>
                <Link
                  to="/shipper/shipments"
                  className="text-xs font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1"
                >
                  <span>View & Post</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {overview.shipments.length === 0 ? (
                <p className="text-sm text-[#4A6578] py-4">No shipments posted yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {overview.shipments.map((shipment) => (
                    <article
                      key={shipment.id}
                      className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-[#18364B]">
                            <MapPin className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
                            <span>
                              {shipment.originCity}, {shipment.originState} → {shipment.destinationCity},{' '}
                              {shipment.destinationState}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A6578] mt-1">
                            {shipment.cargoType} · {shipment.weightTonnes} Tonnes · {shipment.requiredVehicleSpec}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5FD] border border-[#CBE4F6] text-[11px] font-bold text-[#18364B] shrink-0">
                          {shipment.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#5A7486]">
                        <span>{shipment.pickupDateLabel}</span>
                        <span className="font-extrabold text-[#18364B]">
                          Est. {formatInr(shipment.estimatedBudgetInr)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Sample Transporter Listings */}
            <section className="xl:col-span-5 rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                {session.isDemo ? 'Sample Transporter Listings' : 'Available Transporters'}
              </h3>
              {overview.transporters.length === 0 ? (
                <p className="text-sm text-[#4A6578] py-4">No transporter listings available yet.</p>
              ) : (
                <div className="divide-y divide-[#EAF2F8]">
                  {overview.transporters.map((tr) => (
                    <div key={tr.id} className="py-3 first:pt-1 last:pb-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-[#18364B]">{tr.transporterName}</p>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E7F8D8] border border-[#C5ECAA] text-[11px] font-bold text-[#286B14]">
                          {tr.verificationLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#3F5B6E]">
                        {tr.vehicleSpec} · {tr.baseCorridor}
                      </p>
                      <p className="text-[11px] font-semibold text-[#1570EF]">
                        {tr.availableCount} trucks available (Sample)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sample Offers & Sample Bookings */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <section className="xl:col-span-6 rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                {session.isDemo ? 'Sample Offers Received' : 'Transporter Offers'}
              </h3>
              {overview.offers.length === 0 ? (
                <p className="text-sm text-[#4A6578] py-4">No offers received yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {overview.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#18364B]">{offer.routeLabel}</p>
                        <p className="text-xs text-[#4A6578]">
                          {offer.transporterName} · {offer.vehicleReg} · {offer.etaLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-[#18364B]">
                            {formatInr(offer.quotedFreightInr)}
                          </p>
                          <p className="text-[11px] font-semibold text-[#5A7486]">{offer.status}</p>
                        </div>
                        {offer.status === 'Awaiting Shipper' ? (
                          <button
                            type="button"
                            onClick={() => void handleAcceptOffer(offer.id)}
                            disabled={acceptingOfferId === offer.id}
                            className="h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                          >
                            {acceptingOfferId === offer.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            ) : null}
                            <span>Accept Demo Offer</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-[#E7F8D8] border border-[#C5ECAA] text-xs font-bold text-[#286B14]">
                            Accepted
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="xl:col-span-6 rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                {session.isDemo ? 'Sample Bookings' : 'Active Bookings'}
              </h3>
              {overview.bookings.length === 0 ? (
                <p className="text-sm text-[#4A6578] py-4">No confirmed bookings yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {overview.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#18364B]">{booking.routeLabel}</p>
                        <p className="text-xs text-[#4A6578]">
                          {booking.transporterName} · {booking.vehicleReg} · {booking.cargoSummary}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-[#18364B]">
                          {formatInr(booking.agreedFreightInr)}
                        </p>
                        <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#DDF0FD] border border-[#B6DDF9] text-[11px] font-bold text-[#1570EF]">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </ShipperWorkspaceShell>
  );
}

function ShipperStatCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: 'blue' | 'lime';
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[16px] border px-3.5 py-3 flex items-center gap-3',
        tone === 'blue' ? 'bg-[#EAF5FD] border-[#D3E8F7]' : 'bg-[#F1FBE0] border-[#D8F0AF]',
      )}
    >
      <span
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-white/85',
          tone === 'blue' ? 'border-[#CBE3F4]' : 'border-[#CDECA0]',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#3F5B6E] truncate">{label}</p>
        <p className="text-[20px] font-extrabold text-[#18364B] leading-tight">{value}</p>
      </div>
    </div>
  );
}
