import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Coins,
  FileEdit,
  Handshake,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { fetchShipperDashboard } from '../../services/transporter/transporterDashboardService';
import { cn } from '../../utils/cn';
import {
  OrvexTruckCutout,
  ReturnLoadBannerBackdrop,
  RoutePinsDecoration,
} from '../transporterDashboard/components/TransporterScenicArt';
import type {
  ShipperDashboardOverview,
  ShipperShipmentStatus,
} from '../transporterDashboard/transporterDashboardTypes';
import { formatInr } from '../transporterDashboard/transporterDashboardUtils';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperCargoThumb, ShipperWelcomeBannerBackdrop } from './ShipperScenicArt';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getShipmentStatusBadgeStyle(status: ShipperShipmentStatus) {
  switch (status) {
    case 'Booked':
      return {
        pill: 'bg-[#E7F8D8] text-[#286B14] border-[#C5ECAA]',
        icon: 'check' as const,
      };
    case 'In Transit':
      return {
        pill: 'bg-[#DDF0FD] text-[#1570EF] border-[#B6DDF9]',
        icon: 'check' as const,
      };
    case 'Delivered':
    case 'Completed':
      return {
        pill: 'bg-[#EEF5FB] text-[#18364B] border-[#CEDEEB]',
        icon: 'check' as const,
      };
    case 'Offer Received':
    case 'Open for Quotes':
    case 'Finding Transporter':
    case 'Posted':
      return {
        pill: 'bg-[#FFF5D9] text-[#8A5A00] border-[#F4DB88]',
        icon: 'clock' as const,
      };
    case 'Cancelled':
      return {
        pill: 'bg-[#FEF3F2] text-[#B42318] border-[#F5B5B5]',
        icon: 'x' as const,
      };
    case 'Draft':
    default:
      return {
        pill: 'bg-[#F2F6FA] text-[#4A6578] border-[#D6E4EE]',
        icon: 'draft' as const,
      };
  }
}

export function ShipperHomePage() {
  const { session } = useShipperSession();
  const [overview, setOverview] = useState<ShipperDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const businessName =
    overview?.businessProfile.businessName ??
    session.companyName ??
    session.displayName;

  return (
    <ShipperWorkspaceShell
      pageTitle="Shipper Dashboard"
      businessDisplayName={businessName}
      initialNotifications={overview?.notifications}
      initialUnreadCount={overview?.unreadNotificationCount}
    >
      {loading && !overview ? (
        <ShipperDashboardSkeleton />
      ) : errorMessage && !overview ? (
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3 shadow-[0_4px_16px_-4px_rgba(24,54,75,0.08)]">
          <AlertCircle className="w-8 h-8 text-[#B42318] mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-[#18364B]">Unable to Load Shipper Dashboard</h2>
          <p className="text-sm text-[#4A6578] max-w-md mx-auto">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      ) : overview ? (
        <div className="space-y-4">
          {/* 1. Welcome Hero Banner */}
          <section
            aria-label="Shipper welcome overview"
            className="relative rounded-[20px] overflow-hidden border border-[#CBE4F6] shadow-[0_4px_18px_-6px_rgba(24,54,75,0.1)] min-h-[146px] sm:min-h-[168px] flex items-center"
          >
            <ShipperWelcomeBannerBackdrop />
            <div className="relative z-10 w-full px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
              <div className="space-y-2.5 max-w-[74%] sm:max-w-[58%]">
                <div className="space-y-1">
                  <h2 className="text-[19px] sm:text-[26px] font-extrabold text-[#18364B] tracking-tight leading-snug">
                    {getGreetingPrefix()}, {businessName}! <span aria-hidden="true">👋</span>
                  </h2>
                  <p className="hidden sm:block text-[13.5px] font-medium text-[#355368]">
                    Here&apos;s your shipment business overview on ORVEX.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8FA7B] border border-[#B7EC42] text-[#18364B] text-[12px] font-bold shadow-[0_2px_6px_rgba(24,54,75,0.06)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#228B22] shrink-0" aria-hidden="true" />
                  <span>Verified Shipper</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. KPI Performance Summary (2x2 mobile, 4-up desktop) */}
          <section
            aria-label="Shipper performance summary"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5"
          >
            <ShipperKpiCard
              tone="blue"
              icon={<Package className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
              label="Total Shipments"
              value={String(overview.metrics.totalShipments)}
            />
            <ShipperKpiCard
              tone="lime"
              icon={<Truck className="w-5 h-5 text-[#3B8700]" aria-hidden="true" />}
              label="Active Bookings"
              value={String(overview.metrics.activeBookings)}
            />
            <ShipperKpiCard
              tone="blue"
              icon={<Handshake className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
              label="Open Offers"
              value={String(overview.metrics.openOffers)}
            />
            <ShipperKpiCard
              tone="lime"
              icon={<Coins className="w-5 h-5 text-[#3B8700]" aria-hidden="true" />}
              label="Monthly Spend"
              value={formatInr(overview.metrics.monthlySpendInr)}
            />
          </section>

          {/* 3. Quick Actions */}
          <section
            aria-label="Quick shipper actions"
            className="rounded-[20px] bg-white border border-[#DCEAF4] p-3.5 sm:p-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)] space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18364B]">
                Quick Actions
              </h3>
              <span className="hidden sm:inline text-[13px] font-medium text-[#355368]">
                Manage Your Shipments
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <ShipperQuickActionTile
                to="/shipper/post"
                label="Post a Shipment"
                icon={<Package className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="plus"
              />
              <ShipperQuickActionTile
                to="/shipper/trucks"
                label="Find Trucks"
                icon={<Search className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="plus"
              />
              <ShipperQuickActionTile
                to="/shipper/offers"
                label="Manage Offers"
                icon={<Handshake className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="plus"
              />
              <ShipperQuickActionTile
                to="/shipper/tracking"
                label="Track Shipments"
                icon={<CalendarCheck2 className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="arrow"
              />
            </div>
          </section>

          {/* 4. Two-Column Content Area: Recent Shipments + Recommended Transporters */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* Left Panel: Recent Shipments */}
            <section
              aria-label="Recent shipments"
              className="xl:col-span-6 rounded-[20px] bg-white border border-[#DCEAF4] p-3.5 sm:p-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                  Recent Shipments
                </h3>
                <Link
                  to="/shipper/shipments"
                  className="text-[12.5px] font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <span className="sm:hidden">View All</span>
                  <span className="hidden sm:inline">View All Shipments</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {overview.shipments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBE0EE] bg-[#F7FBFE] p-6 text-center space-y-2.5">
                  <Package className="w-7 h-7 text-[#5A7486] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[#18364B]">No shipments yet.</p>
                  <p className="text-xs text-[#4A6578] max-w-sm mx-auto">
                    Start by posting your first shipment and discover suitable transporters.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/shipper/post"
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Post Your First Shipment</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {overview.shipments.slice(0, 3).map((shipment, idx) => {
                    const badge = getShipmentStatusBadgeStyle(shipment.status);
                    return (
                      <Link
                        key={shipment.id}
                        to={`/shipper/shipments?id=${encodeURIComponent(shipment.id)}`}
                        className={cn(
                          'group rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] hover:border-[#8BC9F0] hover:bg-[#F4FAFE] transition-colors p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3',
                          idx === 2 && 'hidden sm:flex',
                        )}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <ShipperCargoThumb className="w-11 h-9 sm:w-14 sm:h-11" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[13px] sm:text-[13.5px] font-extrabold text-[#18364B] truncate group-hover:text-[#1570EF] transition-colors">
                                {shipment.id}
                              </p>
                              <span
                                className={cn(
                                  'sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-bold shrink-0 whitespace-nowrap',
                                  badge.pill,
                                )}
                              >
                                {badge.icon === 'check' ? (
                                  <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                                ) : badge.icon === 'x' ? (
                                  <XCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                                ) : badge.icon === 'draft' ? (
                                  <FileEdit className="w-3 h-3 shrink-0" aria-hidden="true" />
                                ) : (
                                  <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                                )}
                                <span>{shipment.status}</span>
                              </span>
                            </div>
                            <p className="text-[11.5px] sm:text-[12px] font-medium text-[#4A6578] flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-snug">
                              <span>
                                {shipment.originCity}, {shipment.originState}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#5A7486] shrink-0" aria-hidden="true" />
                              <span>
                                {shipment.destinationCity}, {shipment.destinationState}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-bold shrink-0 whitespace-nowrap',
                            badge.pill,
                          )}
                        >
                          {badge.icon === 'check' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          ) : badge.icon === 'x' ? (
                            <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          ) : badge.icon === 'draft' ? (
                            <FileEdit className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          )}
                          <span>{shipment.status}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right Panel: Recommended Transporters for You */}
            <section
              aria-label="Recommended transporters"
              className="xl:col-span-6 rounded-[20px] bg-white border border-[#DCEAF4] p-3.5 sm:p-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                  <span className="sm:hidden">Recommended Transporters</span>
                  <span className="hidden sm:inline">Recommended Transporters for You</span>
                </h3>
                <Link
                  to="/shipper/trucks"
                  className="text-[12.5px] font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <span>View More</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {overview.transporters.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBE0EE] bg-[#F7FBFE] p-6 text-center space-y-2.5">
                  <Truck className="w-7 h-7 text-[#5A7486] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[#18364B]">No recommended transporters yet.</p>
                  <p className="text-xs text-[#4A6578] max-w-sm mx-auto">
                    Post a shipment to discover compatible transporters.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/shipper/post"
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Post a Shipment</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {overview.transporters.slice(0, 2).map((tr, idx) => (
                    <article
                      key={tr.id}
                      className={cn(
                        'rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3',
                        idx === 1 && 'hidden sm:flex',
                      )}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-16 sm:w-20 h-12 sm:h-14 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] flex items-center justify-center shrink-0 overflow-hidden p-1">
                          <OrvexTruckCutout alt={`${tr.transporterName} fleet truck`} className="w-full h-full object-contain" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-[13.5px] sm:text-[14.5px] font-extrabold text-[#18364B] leading-snug sm:truncate">
                            {tr.transporterName}
                          </p>

                          {(tr.rating != null || tr.completedTrips != null) ? (
                            <div className="flex items-center gap-2 text-[12px] text-[#3F5B6E]">
                              {tr.rating != null ? (
                                <span className="inline-flex items-center gap-1 font-bold text-[#18364B] tabular-nums">
                                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                                  <span>{tr.rating.toFixed(1)}</span>
                                </span>
                              ) : null}
                              {tr.completedTrips != null ? (
                                <span className="tabular-nums">({tr.completedTrips} Trips)</span>
                              ) : null}
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] font-medium text-[#4A6578]">
                            <span className="inline-flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-[#4A6578] shrink-0" aria-hidden="true" />
                              <span>{tr.vehicleSpec}</span>
                            </span>
                            {(tr.operatingRegion || tr.baseCorridor) ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#4A6578] shrink-0" aria-hidden="true" />
                                <span>{tr.operatingRegion ?? tr.baseCorridor}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/shipper/trucks?transporterId=${encodeURIComponent(tr.id)}`}
                        className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-[12px] sm:text-[12.5px] font-bold inline-flex items-center justify-center gap-1 shrink-0 whitespace-nowrap self-end sm:self-auto transition-colors"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 5. Bottom Promotional Banner */}
          <section
            aria-label="Post a shipment promotional banner"
            className="relative rounded-[20px] overflow-hidden border border-[#CBE4F6] shadow-[0_4px_18px_-6px_rgba(24,54,75,0.08)]"
          >
            <ReturnLoadBannerBackdrop />
            <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="hidden md:flex items-end shrink-0">
                <OrvexTruckCutout
                  alt=""
                  className="w-[210px] h-[112px] object-contain drop-shadow-[0_10px_14px_rgba(24,54,75,0.22)]"
                />
              </div>

              <div className="flex-1 text-center md:text-left space-y-2 max-w-xl">
                <h3 className="text-[19px] sm:text-[22px] font-extrabold text-[#18364B] tracking-tight leading-tight">
                  Find the Right Truck, Right Away!
                </h3>
                <p className="text-[13px] sm:text-[13.5px] font-medium text-[#2F4D62]">
                  Post your shipment, get competitive offers, and book reliable transporters in minutes.
                </p>
                <div className="pt-0.5">
                  <Link
                    to="/shipper/post"
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-[13.5px] font-bold shadow-[0_4px_12px_rgba(24,54,75,0.12)] transition-colors"
                  >
                    <span>Post a Shipment</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-end shrink-0">
                <RoutePinsDecoration />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </ShipperWorkspaceShell>
  );
}

function ShipperKpiCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: 'blue' | 'lime';
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[16px] border px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center gap-3',
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
        <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#3F5B6E] truncate">
          {label}
        </p>
        <p className="text-[17px] sm:text-[21px] font-extrabold text-[#18364B] leading-tight truncate tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

function ShipperQuickActionTile({
  to,
  label,
  icon,
  trailing,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  trailing: 'plus' | 'arrow';
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-[#DCEAF4] bg-[#FBFDFE] hover:border-[#8BC9F0] hover:bg-[#F3FAFF] transition-all p-2.5 lg:px-3.5 lg:py-3 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-1.5 lg:gap-2.5 text-center lg:text-left shadow-[0_2px_8px_-3px_rgba(24,54,75,0.05)]"
    >
      <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2.5 min-w-0">
        <span className="w-8 h-8 rounded-xl bg-[#EEF8FE] border border-[#DCEAF4] flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="text-[11px] sm:text-[12px] lg:text-[13px] font-bold text-[#18364B] leading-tight lg:truncate">
          {label}
        </span>
      </div>

      {trailing === 'plus' ? (
        <span
          className="hidden lg:inline-flex w-6 h-6 rounded-full bg-[#C8F542] text-[#18364B] items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
          aria-hidden="true"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.6]" />
        </span>
      ) : (
        <ArrowRight
          className="hidden lg:block w-4 h-4 text-[#18364B] shrink-0 group-hover:translate-x-0.5 transition-transform"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

function ShipperDashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading shipper dashboard">
      <div className="h-[164px] rounded-[20px] bg-[#E3F1FA]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="h-20 rounded-[16px] bg-[#E3F1FA]" />
        <div className="h-20 rounded-[16px] bg-[#E9F6DC]" />
        <div className="h-20 rounded-[16px] bg-[#E3F1FA]" />
        <div className="h-20 rounded-[16px] bg-[#E9F6DC]" />
      </div>
      <div className="h-24 rounded-[20px] bg-white border border-[#DCEAF4]" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-6 h-64 rounded-[20px] bg-white border border-[#DCEAF4]" />
        <div className="xl:col-span-6 h-64 rounded-[20px] bg-white border border-[#DCEAF4]" />
      </div>
    </div>
  );
}
