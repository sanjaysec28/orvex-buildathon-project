import { ArrowLeft, Building2, ShieldCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BrandWordmark,
  Button,
  Card,
  SectionHeader,
  StatusNotice,
} from '../../components/ui';
import { useRoleContext } from '../../hooks/useRoleContext';
import { firebaseAuthContract } from '../../services/auth/authContract';
import { getWorkspaceBasePath } from '../../utils/roleRouting';
import { ShipperLoginPage } from '../shipperAuthentication/ShipperLoginPage';
import { TransporterLoginPage } from './TransporterLoginPage';

export function AuthFoundationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, setRole } = useRoleContext();

  const roleParam = searchParams.get('role');

  // Render Page 04 — Transporter Login when explicitly requested or when active role is transporter
  if (roleParam === 'transporter' || (role === 'transporter' && roleParam !== 'shipper')) {
    return <TransporterLoginPage />;
  }

  // Render Screen 01 — Shipper Login when role is shipper or ?role=shipper
  if (roleParam === 'shipper' || role === 'shipper') {
    return <ShipperLoginPage />;
  }

  const activeRole = roleParam === 'shipper' ? 'shipper' : role;

  const openWorkspace = (targetRole: 'transporter' | 'shipper') => {
    setRole(targetRole);
    navigate(getWorkspaceBasePath(targetRole));
  };

  return (
    <div className="min-h-screen bg-[#F6FBFF] text-[#18364B]">
      <header className="bg-white border-b border-[#D2E7F4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center">
            <BrandWordmark size="md" />
          </Link>
          <Link
            to="/role"
            className="min-h-[44px] px-3.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold text-[#18364B] hover:bg-[#E5F3FA]"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('roles.switchRole')}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader headingLevel="h1" title={t('auth.title')} subtitle={t('auth.subtitle')} />

        <StatusNotice
          tone="ice"
          icon={<ShieldCheck className="w-4 h-4" />}
          title={t('architecture.providers.firebase_auth.label')}
          message={`${t('auth.phaseNotice')} (${firebaseAuthContract.provider} · ${t('architecture.statusNotConnected')})`}
        />

        <Card padding="lg" className="space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#3F5B6E]">
              {t('auth.roleLabel')}
            </p>
            <p className="text-lg font-bold text-[#18364B]">
              {activeRole === 'transporter'
                ? t('roles.transporter.title')
                : t('roles.shipper.title')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<Truck className="w-4 h-4" />}
              onClick={() => openWorkspace('transporter')}
            >
              {t('auth.continueTransporter')}
            </Button>
            <Button
              variant="positive"
              size="lg"
              fullWidth
              icon={<Building2 className="w-4 h-4" />}
              onClick={() => openWorkspace('shipper')}
            >
              {t('auth.continueShipper')}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
