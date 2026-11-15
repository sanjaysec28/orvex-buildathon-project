import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Loader2,
  LogOut,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../hooks/useRoleContext';
import {
  fetchAuthSession,
  logoutTransporterSession,
} from '../../services/transporter/transporterDashboardService';
import { OrvexWordmark } from '../transporterDashboard/components/OrvexDarkLogo';
import type { AuthenticatedUserSession } from '../transporterDashboard/transporterDashboardTypes';
import { evaluateShipperAccess } from '../transporterDashboard/transporterDashboardUtils';

interface ShipperSessionContextValue {
  session: AuthenticatedUserSession;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const ShipperSessionContext = createContext<ShipperSessionContextValue | null>(null);

export function useShipperSession(): ShipperSessionContextValue {
  const ctx = useContext(ShipperSessionContext);
  if (!ctx) {
    throw new Error('useShipperSession must be used inside ShipperAuthGuard');
  }
  return ctx;
}

export function ShipperAuthGuard({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearRole } = useRoleContext();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthenticatedUserSession | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    const res = await fetchAuthSession();
    setSession(res.authenticated && res.user ? res.user : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession, location.pathname]);

  const handleLogout = useCallback(async () => {
    await logoutTransporterSession();
    clearRole();
    setSession(null);
    navigate('/auth?role=shipper', { replace: true });
  }, [clearRole, navigate]);

  const contextValue = useMemo(
    () =>
      session
        ? {
            session,
            refreshSession: loadSession,
            logout: handleLogout,
          }
        : null,
    [session, loadSession, handleLogout],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FBFF] flex flex-col items-center justify-center gap-3 text-[#18364B] p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#1570EF]" aria-hidden="true" />
        <p className="text-sm font-semibold text-[#3F5B6E]">Verifying your ORVEX Shipper session...</p>
      </div>
    );
  }

  const decision = evaluateShipperAccess(session);

  if (!decision.allow) {
    if (decision.action === 'redirect_login') {
      return <Navigate to="/auth?role=shipper" replace state={{ from: location.pathname }} />;
    }
    if (decision.action === 'redirect_transporter') {
      return <Navigate to="/transporter" replace />;
    }
    if (decision.action === 'show_verification_status' && session) {
      return (
        <ShipperVerificationGateScreen
          session={session}
          onLogout={handleLogout}
          onUpdateApplication={() => navigate('/shipper/register')}
        />
      );
    }
  }

  if (!contextValue) {
    return <Navigate to="/auth?role=shipper" replace />;
  }

  return (
    <ShipperSessionContext.Provider value={contextValue}>
      {children ?? <Outlet />}
    </ShipperSessionContext.Provider>
  );
}

function ShipperVerificationGateScreen({
  session,
  onLogout,
  onUpdateApplication,
}: {
  session: AuthenticatedUserSession;
  onLogout: () => Promise<void>;
  onUpdateApplication: () => void;
}) {
  const status = session.verificationStatus;
  const isActionNeeded = status === 'Action Required' || status === 'Rejected' || status === 'Draft';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F3FA] via-[#F6FBFF] to-[#F6FBFF] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-[24px] bg-white border border-[#DCEAF4] shadow-[0_14px_34px_-10px_rgba(24,54,75,0.12)] p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <OrvexWordmark variant="light-bg" />
          <span
            className={
              status === 'Action Required'
                ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3E0] text-[#B45309] border border-[#FCD38D] text-xs font-bold'
                : status === 'Rejected'
                  ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3F2] text-[#B42318] border border-[#F5B5B5] text-xs font-bold'
                  : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2C6] text-[#6B4A00] border border-[#F4DB88] text-xs font-bold'
            }
          >
            {status === 'Action Required' ? (
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            ) : status === 'Rejected' ? (
              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{status}</span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[22px] font-extrabold text-[#18364B] leading-tight">
            Shipper Verification Required
          </h1>
          <p className="text-sm text-[#4A6578] leading-relaxed">
            Hello <span className="font-semibold text-[#18364B]">{session.displayName}</span>, your shipper account is currently{' '}
            <span className="font-semibold text-[#18364B]">{status}</span>. Shipment posting and booking workflows unlock once verification is approved.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F6FBFF] border border-[#DCEAF4] p-4 flex items-start gap-3 text-xs text-[#3F5B6E]">
          <ShieldAlert className="w-4 h-4 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            {session.reviewNote ??
              'ORVEX business verification is in progress. You will be notified once approval completes.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {isActionNeeded ? (
            <button
              type="button"
              onClick={onUpdateApplication}
              className="flex-1 h-12 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Update Verification Details</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void onLogout()}
            className="h-12 px-5 rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
