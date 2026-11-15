import {
  ArrowRight,
  Bell,
  Bookmark,
  CalendarCheck2,
  CheckCheck,
  CreditCard,
  FileText,
  Handshake,
  Loader2,
  MapPin,
  Search,
  Star,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  acceptDemoShipperOffer,
  fetchShipperDashboard,
  markShipperNotificationsRead,
} from '../../services/transporter/transporterDashboardService';
import { cn } from '../../utils/cn';
import { OrvexTruckCutout } from '../transporterDashboard/components/TransporterScenicArt';
import type { ShipperDashboardOverview } from '../transporterDashboard/transporterDashboardTypes';
import { formatInr } from '../transporterDashboard/transporterDashboardUtils';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

function useShipperOverviewData() {
  const [overview, setOverview] = useState<ShipperDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await fetchShipperDashboard();
    if (res.ok) {
      setOverview(res.data.overview);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { overview, setOverview, loading, reload };
}

export function ShipperFindTrucksPage() {
  const { overview, loading } = useShipperOverviewData();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTransporterId = searchParams.get('transporterId');
  const selectedTransporter =
    overview?.transporters.find((t) => t.id === selectedTransporterId) ?? null;

  return (
    <ShipperWorkspaceShell pageTitle="Find Trucks">
      <div className="space-y-4">
        {selectedTransporter ? (
          <section className="rounded-[20px] bg-white border border-[#8BC9F0] p-5 space-y-3 shadow-[0_4px_16px_-4px_rgba(24,54,75,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] p-1">
                  <OrvexTruckCutout alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#18364B]">
                    {selectedTransporter.transporterName}
                  </h2>
                  <p className="text-xs text-[#4A6578]">
                    {selectedTransporter.vehicleSpec} · {selectedTransporter.operatingRegion ?? selectedTransporter.baseCorridor}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="text-xs font-bold text-[#1570EF] hover:underline cursor-pointer"
              >
                Show All Transporters
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#3F5B6E]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E7F8D8] border border-[#C5ECAA] text-[#286B14] font-bold">
                {selectedTransporter.verificationLabel}
              </span>
              {selectedTransporter.rating != null ? (
                <span className="inline-flex items-center gap-1 font-bold text-[#18364B]">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                  <span>{selectedTransporter.rating.toFixed(1)}</span>
                </span>
              ) : null}
              {selectedTransporter.completedTrips != null ? (
                <span>{selectedTransporter.completedTrips} Trips</span>
              ) : null}
              <span>{selectedTransporter.availableCount} compatible trucks listed</span>
            </div>
          </section>
        ) : null}

        <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
              <span>Compatible Verified Transporters</span>
            </h2>
            <Link
              to="/shipper/post"
              className="h-8 px-3.5 rounded-full bg-[#C8F542] text-[#18364B] text-xs font-bold inline-flex items-center gap-1"
            >
              <span>Post Shipment</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-[#4A6578]">Loading compatible transporters...</p>
          ) : !overview || overview.transporters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#CBE0EE] bg-[#F7FBFE] p-6 text-center space-y-2">
              <Truck className="w-7 h-7 text-[#5A7486] mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold text-[#18364B]">No recommended transporters yet.</p>
              <p className="text-xs text-[#4A6578]">
                Post a shipment to discover compatible transporters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overview.transporters.map((tr) => (
                <article
                  key={tr.id}
                  className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-12 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] p-1 shrink-0">
                      <OrvexTruckCutout alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-extrabold text-[#18364B] truncate">{tr.transporterName}</p>
                      <p className="text-xs text-[#4A6578] truncate">
                        {tr.vehicleSpec} · {tr.operatingRegion ?? tr.baseCorridor}
                      </p>
                      <p className="text-[11px] font-semibold text-[#1570EF]">
                        {tr.verificationLabel} · {tr.availableCount} trucks available
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ transporterId: tr.id })}
                    className="h-8 px-3.5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold shrink-0 cursor-pointer"
                  >
                    View Profile
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </ShipperWorkspaceShell>
  );
}

export function ShipperOffersPage() {
  const { overview, setOverview, loading } = useShipperOverviewData();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleAccept = async (offerId: string) => {
    if (acceptingId) return;
    setAcceptingId(offerId);
    const res = await acceptDemoShipperOffer(offerId);
    if (res.ok) {
      setOverview(res.data.overview);
    }
    setAcceptingId(null);
  };

  return (
    <ShipperWorkspaceShell pageTitle="Offers & Negotiations">
      <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
          <Handshake className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
          <span>Transporter Quotes & Offers</span>
        </h2>
        {loading ? (
          <p className="text-sm text-[#4A6578]">Loading offers...</p>
        ) : !overview || overview.offers.length === 0 ? (
          <p className="text-sm text-[#4A6578]">No freight offers received yet.</p>
        ) : (
          <div className="space-y-2.5">
            {overview.offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#18364B]">{offer.routeLabel}</p>
                  <p className="text-xs text-[#4A6578]">
                    {offer.transporterName} · {offer.vehicleReg} · {offer.etaLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#18364B] tabular-nums">
                      {formatInr(offer.quotedFreightInr)}
                    </p>
                    <p className="text-[11px] font-semibold text-[#5A7486]">{offer.status}</p>
                  </div>
                  {offer.status === 'Awaiting Shipper' ? (
                    <button
                      type="button"
                      onClick={() => void handleAccept(offer.id)}
                      disabled={acceptingId === offer.id}
                      className="h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {acceptingId === offer.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : null}
                      <span>Accept Offer</span>
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
    </ShipperWorkspaceShell>
  );
}

export function ShipperBookingsPage() {
  const { overview, loading } = useShipperOverviewData();

  return (
    <ShipperWorkspaceShell pageTitle="Active Bookings">
      <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
          <span>Confirmed & Active Bookings</span>
        </h2>
        {loading ? (
          <p className="text-sm text-[#4A6578]">Loading bookings...</p>
        ) : !overview || overview.bookings.length === 0 ? (
          <p className="text-sm text-[#4A6578]">No active bookings yet.</p>
        ) : (
          <div className="space-y-2.5">
            {overview.bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#18364B]">
                    {booking.id} · {booking.routeLabel}
                  </p>
                  <p className="text-xs text-[#4A6578]">
                    {booking.transporterName} · {booking.vehicleReg} · {booking.cargoSummary}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-[#18364B] tabular-nums">
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
    </ShipperWorkspaceShell>
  );
}

export function ShipperTrackingPage() {
  const { overview, loading } = useShipperOverviewData();
  const active = overview?.bookings.filter((b) => b.status !== 'Delivered') ?? [];

  return (
    <ShipperWorkspaceShell pageTitle="Live Tracking">
      <div className="space-y-4">
        <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
            <span>Active Transit Shipments</span>
          </h2>
          {loading ? (
            <p className="text-sm text-[#4A6578]">Loading shipment tracking...</p>
          ) : active.length === 0 ? (
            <p className="text-sm text-[#4A6578]">No shipments currently in transit.</p>
          ) : (
            <div className="space-y-2.5">
              {active.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-[#DCEAF4] bg-[#F6FBFF] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-bold text-[#18364B]">{b.routeLabel}</p>
                    <p className="text-xs text-[#4A6578]">
                      {b.transporterName} · {b.vehicleReg} · {b.etaLabel ?? b.status}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DDF0FD] border border-[#B6DDF9] text-[11px] font-bold text-[#1570EF] self-start sm:self-center">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ShipperWorkspaceShell>
  );
}

export function ShipperPaymentsPage() {
  const { overview, loading } = useShipperOverviewData();

  return (
    <ShipperWorkspaceShell pageTitle="Payments & Invoices">
      <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
            <span>Monthly Freight Spend & Booking Ledger</span>
          </h2>
          {overview ? (
            <p className="text-lg font-extrabold text-[#18364B] tabular-nums">
              {formatInr(overview.metrics.monthlySpendInr)}
            </p>
          ) : null}
        </div>
        {loading ? (
          <p className="text-sm text-[#4A6578]">Loading billing ledger...</p>
        ) : !overview || overview.bookings.length === 0 ? (
          <p className="text-sm text-[#4A6578]">No invoices or freight spend recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#EAF2F8]">
            {overview.bookings.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#18364B]">
                    {b.id} · {b.routeLabel}
                  </p>
                  <p className="text-xs text-[#4A6578]">{b.transporterName}</p>
                </div>
                <p className="text-sm font-extrabold text-[#18364B] tabular-nums">
                  {formatInr(b.agreedFreightInr)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </ShipperWorkspaceShell>
  );
}

export function ShipperLocationsPage() {
  const { overview, loading } = useShipperOverviewData();

  return (
    <ShipperWorkspaceShell pageTitle="Saved Locations">
      <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
          <span>Pickup Hubs & Delivery Locations</span>
        </h2>
        {loading ? (
          <p className="text-sm text-[#4A6578]">Loading saved locations...</p>
        ) : !overview || overview.savedLocations.length === 0 ? (
          <p className="text-sm text-[#4A6578]">No saved pickup or delivery locations yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.savedLocations.map((loc) => (
              <div key={loc.id} className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#18364B]">{loc.label}</p>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5FD] border border-[#CBE4F6] text-[11px] font-bold text-[#18364B]">
                    {loc.locationType}
                  </span>
                </div>
                <p className="text-xs text-[#4A6578]">{loc.addressLine}</p>
                <p className="text-[11px] font-semibold text-[#1570EF]">
                  {loc.city}, {loc.state}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </ShipperWorkspaceShell>
  );
}

export function ShipperNotificationsPage() {
  const { overview, setOverview, loading } = useShipperOverviewData();

  const handleMarkAll = async () => {
    const res = await markShipperNotificationsRead('all');
    if (res.ok && overview) {
      setOverview({
        ...overview,
        unreadNotificationCount: res.data.unreadCount,
        notifications: overview.notifications.map((n) => ({ ...n, read: true })),
      });
    }
  };

  return (
    <ShipperWorkspaceShell
      pageTitle="Notifications"
      initialNotifications={overview?.notifications}
      initialUnreadCount={overview?.unreadNotificationCount}
    >
      <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
            <span>Shipment Alerts & Updates</span>
          </h2>
          {overview && overview.unreadNotificationCount > 0 ? (
            <button
              type="button"
              onClick={() => void handleMarkAll()}
              className="text-xs font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mark all read</span>
            </button>
          ) : null}
        </div>
        {loading ? (
          <p className="text-sm text-[#4A6578]">Loading notifications...</p>
        ) : !overview || overview.notifications.length === 0 ? (
          <p className="text-sm text-[#4A6578]">No notifications right now.</p>
        ) : (
          <div className="divide-y divide-[#EAF2F8]">
            {overview.notifications.map((n) => (
              <div
                key={n.id}
                className={cn('py-3 px-2 rounded-xl', !n.read && 'bg-[#F6FCEF]')}
              >
                <p className="text-sm font-bold text-[#18364B]">{n.title}</p>
                <p className="text-xs text-[#4A6578] mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </ShipperWorkspaceShell>
  );
}

export function ShipperDocumentsPage() {
  const { session } = useShipperSession();

  return (
    <ShipperWorkspaceShell pageTitle="Document Centre">
      <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#18364B] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
          <span>Business KYC & Dispatch Documents</span>
        </h2>
        {session.isDemo ? (
          <div className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-4 text-xs text-[#3F5B6E] space-y-1">
            <p className="font-bold text-[#18364B]">Demo Verification Status: {session.verificationStatus}</p>
            <p>Demo sessions use synthetic verification credentials and cannot access real KYC vaults.</p>
          </div>
        ) : (
          <p className="text-sm text-[#4A6578]">
            Your verified shipper KYC documents are securely stored in the ORVEX verification vault.
          </p>
        )}
      </section>
    </ShipperWorkspaceShell>
  );
}
