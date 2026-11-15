import { Building2, CheckCircle2, Globe, LogOut, MapPin, Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LanguageSwitcherModal } from '../../components/ui/LanguageSwitcherModal';
import { fetchShipperDashboard } from '../../services/transporter/transporterDashboardService';
import { cn } from '../../utils/cn';
import type { ShipperDashboardOverview } from '../transporterDashboard/transporterDashboardTypes';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperWorkspaceShell } from './ShipperWorkspaceShell';

export function ShipperProfilePage() {
  const { session, logout } = useShipperSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'settings' ? 'settings' : 'profile';
  const [overview, setOverview] = useState<ShipperDashboardOverview | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchShipperDashboard().then((res) => {
      if (active && res.ok) {
        setOverview(res.data.overview);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const business = overview?.businessProfile;
  const businessName =
    business?.businessName ?? session.companyName ?? session.displayName;

  return (
    <ShipperWorkspaceShell
      pageTitle="Profile & Settings"
      businessDisplayName={businessName}
    >
      <div className="max-w-3xl space-y-4">
        {/* Segmented tab bar */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#DCEAF4]">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5',
              activeTab === 'profile'
                ? 'bg-[#C8F542] text-[#18364B]'
                : 'text-[#4A6578] hover:text-[#18364B]',
            )}
          >
            <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Business Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5',
              activeTab === 'settings'
                ? 'bg-[#C8F542] text-[#18364B]'
                : 'text-[#4A6578] hover:text-[#18364B]',
            )}
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Account Settings</span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-[#EAF5FD] border border-[#CBE4F6] flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-[#1570EF]" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#18364B]">{businessName}</h2>
                  <p className="text-xs font-semibold text-[#4A6578]">
                    {session.displayName} · {business?.accountType ?? session.accountTypeLabel ?? 'Shipper'}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8FA7B] border border-[#B7EC42] text-xs font-bold text-[#18364B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#228B22]" aria-hidden="true" />
                <span>{session.verificationStatus}</span>
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EAF2F8] text-sm">
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <dt className="text-xs font-semibold text-[#5A7486]">Primary Pickup Hub</dt>
                <dd className="font-bold text-[#18364B] mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1570EF]" aria-hidden="true" />
                  <span>
                    {business?.primaryHub ?? `${session.city ?? 'India'}, ${session.state ?? ''}`}
                  </span>
                </dd>
              </div>
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <dt className="text-xs font-semibold text-[#5A7486]">Account Classification</dt>
                <dd className="font-bold text-[#18364B] mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#286B14]" aria-hidden="true" />
                  <span>{business?.accountType ?? session.accountTypeLabel ?? 'Shipper'}</span>
                </dd>
              </div>
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <dt className="text-xs font-semibold text-[#5A7486]">Primary Freight Corridors</dt>
                <dd className="font-bold text-[#18364B] mt-0.5">
                  {business?.corridors.length ? business.corridors.join(', ') : 'No corridors configured yet'}
                </dd>
              </div>
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3">
                <dt className="text-xs font-semibold text-[#5A7486]">Typical Goods</dt>
                <dd className="font-bold text-[#18364B] mt-0.5">
                  {business?.typicalGoods ?? 'General Cargo'}
                </dd>
              </div>
            </dl>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => void logout()}
                className="h-10 px-5 rounded-full border border-[#F5B5B5] bg-[#FEF3F2] hover:bg-[#FEE4E2] text-xs font-bold text-[#B42318] inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{session.isDemo ? 'Exit Demo Session' : 'Sign Out'}</span>
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-[#18364B]">Account & App Settings</h2>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[#18364B]">Display Language</p>
                  <p className="text-xs text-[#4A6578]">Switch interface language across ORVEX.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLanguageOpen(true)}
                  className="h-9 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Change Language</span>
                </button>
              </div>

              <div className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] p-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[#18364B]">Session Authentication</p>
                  <p className="text-xs text-[#4A6578]">
                    Signed in via {session.authProvider} ({session.mobileNumber})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="h-9 px-4 rounded-full border border-[#F5B5B5] bg-[#FEF3F2] text-xs font-bold text-[#B42318] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <LanguageSwitcherModal open={languageOpen} onClose={() => setLanguageOpen(false)} />
    </ShipperWorkspaceShell>
  );
}
