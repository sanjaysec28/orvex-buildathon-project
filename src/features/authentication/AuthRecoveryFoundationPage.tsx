import { ArrowLeft, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandWordmark, Card, SectionHeader, StatusNotice } from '../../components/ui';

export function AuthRecoveryFoundationPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isShipper = searchParams.get('role') === 'shipper';
  const backPath = isShipper ? '/auth?role=shipper' : '/auth?role=transporter';
  const backLabel = isShipper ? 'Back to Shipper Login' : t('auth.backToTransporterLogin');
  const subtitle = isShipper
    ? 'Shipper password reset will connect once Firebase Authentication is enabled.'
    : t('auth.forgotPasswordSubtitle');

  return (
    <div className="min-h-screen bg-[#F6FBFF] text-[#18364B]">
      <header className="bg-white border-b border-[#D2E7F4]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandWordmark size="md" />
          <Link
            to={backPath}
            className="min-h-[44px] px-3.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold text-[#18364B] hover:bg-[#E5F3FA]"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('auth.forgotPasswordTitle')}
          subtitle={subtitle}
        />

        <Card padding="lg" className="space-y-4">
          <StatusNotice
            tone="ice"
            icon={<KeyRound className="w-4 h-4" />}
            title={t('architecture.providers.firebase_auth.label')}
            message={t('auth.errors.providerNotConfigured')}
          />
          <Link
            to={backPath}
            className="min-h-[48px] w-full rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </Card>
      </main>
    </div>
  );
}
