import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CalendarCheck2,
  CheckCircle2,
  Coins,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  Search,
  Truck,
  UserPlus,
  Weight,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { fetchDashboardOverview } from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import {
  OrvexTruckCutout,
  ReturnLoadBannerBackdrop,
  RoutePinsDecoration,
  WelcomeBannerBackdrop,
} from '../components/TransporterScenicArt';
import type {
  TransporterDashboardOverview,
  VehicleAvailabilityStatus,
} from '../transporterDashboardTypes';
import { formatInr } from '../transporterDashboardUtils';

function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function vehicleStatusBadge(status: VehicleAvailabilityStatus) {
  switch (status) {
    case 'Available':
      return {
        pill: 'bg-[#E7F8D8] text-[#286B14] border-[#C5ECAA]',
        dot: 'bg-[#54B823]',
      };
    case 'On Trip':
      return {
        pill: 'bg-[#DDF0FD] text-[#1570EF] border-[#B6DDF9]',
        dot: 'bg-[#2A8CF6]',
      };
    case 'Pending Verification':
      return {
        pill: 'bg-[#FFF3D6] text-[#9A6700] border-[#F4DB88]',
        dot: 'bg-[#D99B00]',
      };
    case 'Unavailable':
    default:
      return {
        pill: 'bg-[#EFF5F9] text-[#4A6578] border-[#D6E4EE]',
        dot: 'bg-[#7A94A6]',
      };
  }
}

export function TransporterDashboardPage() {
  const [overview, setOverview] = useState<TransporterDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await fetchDashboardOverview();
    if (!res.ok) {
      setErrorMessage(res.message);
      setLoading(false);
      return;
    }
    setOverview(res.data.overview);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const returnLoadsPath = overview?.activeReturnCorridor
    ? `/transporter/loads?mode=return&origin=${encodeURIComponent(overview.activeReturnCorridor.originCity)}`
    : '/transporter/loads?mode=return';

  return (
    <TransporterDashboardShell
      pageTitle="Transporter Dashboard"
      initialNotifications={overview?.notifications}
      initialUnreadCount={overview?.unreadNotificationCount}
    >
      {loading && !overview ? (
        <DashboardSkeleton />
      ) : errorMessage && !overview ? (
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3 shadow-[0_4px_16px_-4px_rgba(24,54,75,0.08)]">
          <AlertCircle className="w-8 h-8 text-[#B42318] mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-[#18364B]">Unable to Load Dashboard</h2>
          <p className="text-sm text-[#4A6578] max-w-md mx-auto">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      ) : overview ? (
        <div className="space-y-4">
          {/* 1. Welcome Banner */}
          <section
            aria-label="Transporter welcome overview"
            className="relative rounded-[20px] overflow-hidden border border-[#CBE4F6] shadow-[0_4px_18px_-6px_rgba(24,54,75,0.1)] min-h-[146px] sm:min-h-[160px] flex items-center"
          >
            <WelcomeBannerBackdrop />
            <div className="relative z-10 w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4">
              <div className="space-y-2 max-w-[66%] sm:max-w-[58%]">
                <div className="space-y-1">
                  <h2 className="text-[20px] sm:text-[26px] font-extrabold text-[#18364B] tracking-tight leading-snug">
                    {getGreetingPrefix()}, {overview.profile.displayName}! <span aria-hidden="true">👋</span>
                  </h2>
                  <p className="hidden sm:block text-[13.5px] font-medium text-[#355368]">
                    {overview.profile.isDemo
                      ? 'Sample demo fleet, return-corridor loads, and operations preview on ORVEX.'
                      : "Here's your transport business overview on ORVEX."}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8FA7B] border border-[#B7EC42] text-[#18364B] text-[12px] font-bold shadow-[0_2px_6px_rgba(24,54,75,0.06)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#228B22] shrink-0" aria-hidden="true" />
                  <span>
                    {overview.profile.isDemo ? 'Demo Verified' : 'Verified Transporter'}
                  </span>
                </div>
              </div>

              <div className="relative shrink-0 flex items-end justify-end">
                <OrvexTruckCutout
                  alt="ORVEX freight truck"
                  className="w-[130px] sm:w-[230px] lg:w-[270px] h-[88px] sm:h-[132px] object-contain drop-shadow-[0_12px_18px_rgba(24,54,75,0.22)]"
                />
              </div>
            </div>
          </section>

          {/* 2. KPI Performance Cards (2x2 mobile, 4-up desktop) */}
          <section aria-label="Fleet and earnings summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            <KpiMetricCard
              tone="blue"
              icon={<Truck className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
              mobileLabel="Vehicles"
              desktopLabel="Total Vehicles"
              value={String(overview.metrics.totalVehicles)}
            />
            <KpiMetricCard
              tone="lime"
              icon={<CheckCircle2 className="w-5 h-5 text-[#3B8700]" aria-hidden="true" />}
              mobileLabel="Available"
              desktopLabel="Available Vehicles"
              value={String(overview.metrics.availableVehicles)}
            />
            <KpiMetricCard
              tone="blue"
              icon={<Route className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
              mobileLabel="Active Trips"
              desktopLabel="Active Trips"
              value={String(overview.metrics.activeTrips)}
            />
            <KpiMetricCard
              tone="lime"
              icon={<Coins className="w-5 h-5 text-[#3B8700]" aria-hidden="true" />}
              mobileLabel={overview.profile.isDemo ? 'Earnings (Sample)' : 'Earnings'}
              desktopLabel={overview.profile.isDemo ? 'Monthly Earnings (Sample)' : 'Monthly Earnings'}
              value={formatInr(overview.metrics.monthlyEarningsInr)}
            />
          </section>

          {/* 3. Quick Actions */}
          <section
            aria-label="Quick operational actions"
            className="rounded-[20px] bg-white border border-[#DCEAF4] p-3.5 sm:p-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)] space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18364B]">
                Quick Actions
              </h3>
              <span className="hidden sm:inline text-[13px] font-medium text-[#355368]">
                Manage Your Operations
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <QuickActionTile
                to="/transporter/vehicles?action=add"
                label="Add Vehicle"
                icon={<Truck className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="plus"
              />
              <QuickActionTile
                to="/transporter/drivers?action=add"
                label="Add Driver"
                icon={<UserPlus className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="plus"
              />
              <QuickActionTile
                to="/transporter/availability"
                label="Set Availability"
                icon={<CalendarCheck2 className="w-5 h-5 text-[#3F8D00]" aria-hidden="true" />}
                trailing="plus"
              />
              <QuickActionTile
                to="/transporter/loads"
                label="Discover Loads"
                icon={<Search className="w-5 h-5 text-[#18364B]" aria-hidden="true" />}
                trailing="arrow"
              />
            </div>
          </section>

          {/* 4. Main 2-Column Workspace: Recommended Loads + Vehicle Availability */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* Recommended Loads (appears right under Quick Actions on mobile, right column on desktop) */}
            <section
              aria-label="Recommended loads"
              className="xl:col-span-7 xl:order-2 rounded-[20px] bg-white border border-[#DCEAF4] p-3.5 sm:p-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                  <span className="sm:hidden">Recommended Loads</span>
                  <span className="hidden sm:inline">Recommended Loads for You</span>
                </h3>
                <Link
                  to="/transporter/loads"
                  className="text-[12.5px] font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <span className="sm:hidden">View All</span>
                  <span className="hidden sm:inline">View All Loads</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {overview.recommendedLoads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBE0EE] bg-[#F7FBFE] p-6 text-center space-y-2.5">
                  <Search className="w-7 h-7 text-[#5A7486] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[#18364B]">No matching loads right now.</p>
                  <p className="text-xs text-[#4A6578] max-w-sm mx-auto">
                    We&apos;ll notify you when suitable opportunities become available.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/transporter/loads"
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold"
                    >
                      <span>Explore All Loads</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {overview.recommendedLoads.slice(0, 2).map((load) => (
                    <article
                      key={load.id}
                      className="rounded-2xl border border-[#DCEAF4] bg-[#FCFDFE] p-3 sm:p-3.5 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[13.5px] sm:text-[14.5px] font-bold text-[#18364B]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" aria-hidden="true" />
                            <span>
                              {load.originCity}, {load.originState}
                            </span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#5A7486]" aria-hidden="true" />
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
                            <span>
                              {load.destinationCity}, {load.destinationState}
                            </span>
                          </span>
                        </div>

                        {load.expectedFreightInr !== null ? (
                          <div className="text-right shrink-0">
                            <p className="sm:hidden px-2.5 py-0.5 rounded-full bg-[#EDFAD1] border border-[#CBEF8A] text-[12px] font-extrabold text-[#18364B]">
                              {formatInr(load.expectedFreightInr)}
                            </p>
                            <div className="hidden sm:block">
                              <p className="text-[16px] font-extrabold text-[#18364B] leading-tight">
                                {formatInr(load.expectedFreightInr)}
                              </p>
                              <p className="text-[11px] font-medium text-[#5A7486]">
                                Expected Freight
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-[#3F5B6E]">
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-[#4A6578]" aria-hidden="true" />
                            <span>{load.cargoType}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#4A6578]" aria-hidden="true" />
                            <span>{load.requiredLengthFt}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Weight className="w-3.5 h-3.5 text-[#4A6578]" aria-hidden="true" />
                            <span>{load.weightTonnes} Tonnes</span>
                          </span>
                        </div>

                        <Link
                          to={`/transporter/loads/${encodeURIComponent(load.id)}`}
                          className="w-full sm:w-auto h-9 sm:h-8 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                        >
                          <span>View Load</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Vehicle Availability Panel (left column on desktop) */}
            <section
              aria-label="Vehicle availability"
              className="xl:col-span-5 xl:order-1 rounded-[20px] bg-white border border-[#DCEAF4] p-3.5 sm:p-4 shadow-[0_3px_14px_-4px_rgba(24,54,75,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#18364B]">
                  Vehicle Availability
                </h3>
                <Link
                  to="/transporter/vehicles"
                  className="text-[12.5px] font-bold text-[#1570EF] hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <span>View All Vehicles</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {overview.vehicles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBE0EE] bg-[#F7FBFE] p-6 text-center space-y-2.5">
                  <Truck className="w-7 h-7 text-[#5A7486] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[#18364B]">No vehicles added yet.</p>
                  <p className="text-xs text-[#4A6578]">
                    Add your first vehicle to set availability and receive matching corridor loads.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/transporter/vehicles?action=add"
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add Your First Vehicle</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#EAF2F8]">
                  {overview.vehicles.slice(0, 3).map((vehicle) => {
                    const style = vehicleStatusBadge(vehicle.availabilityStatus);
                    return (
                      <div
                        key={vehicle.id}
                        className="py-2.5 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-11 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] flex items-center justify-center shrink-0 overflow-hidden p-1">
                            <OrvexTruckCutout alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-extrabold text-[#18364B] truncate">
                              {vehicle.registrationNumber}
                            </p>
                            <p className="text-[11.5px] font-medium text-[#5A7486] truncate">
                              {vehicle.lengthFt} · {vehicle.vehicleCategory}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-0.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-bold',
                              style.pill,
                            )}
                          >
                            <span className={cn('w-2 h-2 rounded-full', style.dot)} aria-hidden="true" />
                            <span>{vehicle.availabilityStatus}</span>
                          </span>
                          {vehicle.availabilityStatus === 'On Trip' && vehicle.currentRoute ? (
                            <div className="text-[10.5px] leading-tight text-[#4A6578]">
                              <p className="font-semibold text-[#18364B]">
                                {vehicle.currentRoute.origin} → {vehicle.currentRoute.destination}
                              </p>
                              <p>ETA: {vehicle.currentRoute.etaLabel}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* 5. Return-Load Promotional Banner */}
          <section
            aria-label="Return load opportunity finder"
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
                  Don&apos;t Return Empty!
                </h3>
                <p className="text-[13px] sm:text-[13.5px] font-medium text-[#2F4D62]">
                  {overview.activeReturnCorridor
                    ? `Active corridor ${overview.activeReturnCorridor.originCity} → ${overview.activeReturnCorridor.destinationCity}: get compatible return loads and keep your trucks running profitably.`
                    : 'Get compatible return loads and keep your trucks running profitably.'}
                </p>
                <div className="pt-0.5">
                  <Link
                    to={returnLoadsPath}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-[13.5px] font-bold shadow-[0_4px_12px_rgba(24,54,75,0.12)] transition-colors"
                  >
                    <span>Find Return Loads</span>
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
    </TransporterDashboardShell>
  );
}

function KpiMetricCard({
  tone,
  icon,
  mobileLabel,
  desktopLabel,
  value,
}: {
  tone: 'blue' | 'lime';
  icon: React.ReactNode;
  mobileLabel: string;
  desktopLabel: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[16px] border px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center gap-3',
        tone === 'blue'
          ? 'bg-[#EAF5FD] border-[#D3E8F7]'
          : 'bg-[#F1FBE0] border-[#D8F0AF]',
      )}
    >
      <span
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border',
          tone === 'blue'
            ? 'bg-white/85 border-[#CBE3F4]'
            : 'bg-white/85 border-[#CDECA0]',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#3F5B6E] truncate">
          <span className="sm:hidden">{mobileLabel}</span>
          <span className="hidden sm:inline">{desktopLabel}</span>
        </p>
        <p className="text-[17px] sm:text-[21px] font-extrabold text-[#18364B] leading-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickActionTile({
  to,
  label,
  icon,
  trailing,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
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

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-[156px] rounded-[20px] bg-[#E3F1FA]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="h-20 rounded-[16px] bg-[#E3F1FA]" />
        <div className="h-20 rounded-[16px] bg-[#E9F6DC]" />
        <div className="h-20 rounded-[16px] bg-[#E3F1FA]" />
        <div className="h-20 rounded-[16px] bg-[#E9F6DC]" />
      </div>
      <div className="h-24 rounded-[20px] bg-white border border-[#DCEAF4]" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 h-60 rounded-[20px] bg-white border border-[#DCEAF4]" />
        <div className="xl:col-span-7 h-60 rounded-[20px] bg-white border border-[#DCEAF4]" />
      </div>
    </div>
  );
}
