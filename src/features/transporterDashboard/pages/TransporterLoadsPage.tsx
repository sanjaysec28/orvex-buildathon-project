import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
  Truck,
  Weight,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchTransporterLoads } from '../../../services/transporter/transporterDashboardService';
import { cn } from '../../../utils/cn';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { LoadOpportunity } from '../transporterDashboardTypes';
import { formatInr } from '../transporterDashboardUtils';

export function TransporterLoadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') ?? '';
  const initialOrigin = searchParams.get('origin') ?? '';

  const [originFilter, setOriginFilter] = useState(initialOrigin);
  const [destinationFilter, setDestinationFilter] = useState('');
  const [loads, setLoads] = useState<LoadOpportunity[]>([]);
  const [returnContext, setReturnContext] = useState<{
    originCity: string;
    destinationCity: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    const res = await fetchTransporterLoads({
      mode: mode || undefined,
      origin: originFilter || undefined,
      destination: destinationFilter || undefined,
    });
    if (res.ok) {
      setLoads(res.data.loads);
      setReturnContext(res.data.returnContext);
    }
    setLoading(false);
  }, [mode, originFilter, destinationFilter]);

  useEffect(() => {
    void loadOpportunities();
  }, [loadOpportunities]);

  const toggleReturnMode = (nextReturn: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (nextReturn) {
      next.set('mode', 'return');
    } else {
      next.delete('mode');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <TransporterDashboardShell pageTitle={mode === 'return' ? 'Return Load Discovery' : 'Load Discovery'}>
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-lg font-extrabold text-[#18364B]">
                {mode === 'return' ? 'Compatible Return Loads' : 'Available Freight Loads'}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A6578]">
                {returnContext && mode === 'return'
                  ? `Showing return opportunities from ${returnContext.originCity} back toward ${returnContext.destinationCity}.`
                  : 'Browse freight loads matched to your vehicles along Chennai ↔ Bengaluru and South India corridors.'}
              </p>
            </div>

            <div className="inline-flex rounded-full bg-[#EDF6FC] p-1 border border-[#D4E7F5] self-start">
              <button
                type="button"
                onClick={() => toggleReturnMode(false)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer',
                  mode !== 'return' ? 'bg-[#18364B] text-white' : 'text-[#3F5B6E]',
                )}
              >
                All Loads
              </button>
              <button
                type="button"
                onClick={() => toggleReturnMode(true)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer',
                  mode === 'return' ? 'bg-[#C8F542] text-[#18364B]' : 'text-[#3F5B6E]',
                )}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Return Loads</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Filter by origin city (e.g. Chennai, Bengaluru)"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-medium text-[#18364B]"
            />
            <input
              type="text"
              placeholder="Filter by destination city"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-medium text-[#18364B]"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Searching available freight loads...
          </div>
        ) : loads.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-2.5">
            <Search className="w-8 h-8 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No matching loads found.</h3>
            <p className="text-sm text-[#4A6578]">
              Try clearing city filters or switch between All Loads and Return Loads.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {loads.map((load) => (
              <article
                key={load.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 shadow-[0_3px_12px_-4px_rgba(24,54,75,0.06)] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[15px] font-extrabold text-[#18364B]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
                        <span>
                          {load.originCity}, {load.originState}
                        </span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#5A7486]" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                        <span>
                          {load.destinationCity}, {load.destinationState}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5FD] text-[#1570EF]">
                        {load.corridorTag}
                      </span>
                      {load.isReturnMatch ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#D8FA7B] text-[#18364B]">
                          Return Match
                        </span>
                      ) : null}
                      {load.compatibleVehicleIds.length > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E7F8D8] text-[#286B14]">
                          {load.compatibleVehicleIds.length} Compatible Vehicle
                          {load.compatibleVehicleIds.length > 1 ? 's' : ''}
                        </span>
                      ) : null}
                      {load.offerSubmitted ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E7F8D8] text-[#286B14] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          <span>Offer Submitted</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {load.expectedFreightInr !== null ? (
                    <div className="sm:text-right shrink-0">
                      <p className="text-[18px] font-extrabold text-[#18364B]">
                        {formatInr(load.expectedFreightInr)}
                      </p>
                      <p className="text-[11px] font-medium text-[#5A7486]">Expected Freight</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#EFF6FA]">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#3F5B6E]">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{load.cargoType}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {load.requiredLengthFt} · {load.requiredVehicleCategory}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{load.weightTonnes} Tonnes</span>
                    </span>
                    <span>Pickup: {load.pickupWindowLabel}</span>
                  </div>

                  <Link
                    to={`/transporter/loads/${encodeURIComponent(load.id)}`}
                    className="h-9 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>View Load</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
