import { ArrowRight, BarChart3, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransporterEarnings } from '../../../services/transporter/transporterDashboardService';
import { useTransporterSession } from '../components/TransporterAuthGuard';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import { formatInr } from '../transporterDashboardUtils';

export function TransporterEarningsPage() {
  const { session } = useTransporterSession();
  const isDemo = session.isDemo === true;
  const [monthlyEarningsInr, setMonthlyEarningsInr] = useState(0);
  const [totalCompletedTrips, setTotalCompletedTrips] = useState(0);
  const [payouts, setPayouts] = useState<
    Array<{
      tripId: string;
      routeLabel: string;
      vehicleReg: string;
      freightInr: number;
      completedAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchTransporterEarnings().then((res) => {
      if (!active) return;
      if (res.ok) {
        setMonthlyEarningsInr(res.data.monthlyEarningsInr);
        setTotalCompletedTrips(res.data.totalCompletedTrips);
        setPayouts(res.data.payouts);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <TransporterDashboardShell pageTitle="Earnings">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-[20px] bg-[#F1FBE0] border border-[#D8F0AF] p-5 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-[#3B8700]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#3F5B6E]">
                {isDemo ? 'Monthly Earnings (Sample Demo Data)' : 'Monthly Earnings'}
              </p>
              <p className="text-2xl font-extrabold text-[#18364B]">{formatInr(monthlyEarningsInr)}</p>
            </div>
          </div>

          <div className="rounded-[20px] bg-[#EAF5FD] border border-[#D3E8F7] p-5 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-[#18364B]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#3F5B6E]">
                {isDemo ? 'Completed Trips Settled (Sample)' : 'Completed Trips Settled'}
              </p>
              <p className="text-2xl font-extrabold text-[#18364B]">{totalCompletedTrips}</p>
            </div>
          </div>
        </div>

        <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-extrabold text-[#18364B]">
            {isDemo ? 'Sample Trip Payout History' : 'Trip Payout History'}
          </h2>
          {loading ? (
            <p className="text-sm text-[#4A6578] py-4">Loading earnings history...</p>
          ) : payouts.length === 0 ? (
            <div className="py-6 text-center space-y-2.5">
              <p className="text-sm font-bold text-[#18364B]">No completed trip payouts yet.</p>
              <p className="text-xs text-[#4A6578]">
                Completed trips and freight settlements appear here automatically.
              </p>
              <Link
                to="/transporter/trips"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#C8F542] text-[#18364B] text-xs font-bold"
              >
                <span>View My Trips</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EFF6FA]">
              {payouts.map((item) => (
                <div key={item.tripId} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-bold text-[#18364B]">{item.routeLabel}</p>
                    <p className="text-xs text-[#5A7486]">
                      {item.vehicleReg} ·{' '}
                      {new Intl.DateTimeFormat('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(item.completedAt))}
                    </p>
                  </div>
                  <p className="font-extrabold text-[#286B14]">{formatInr(item.freightInr)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </TransporterDashboardShell>
  );
}
