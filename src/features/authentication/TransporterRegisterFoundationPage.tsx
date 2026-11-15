import { ArrowLeft, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BrandWordmark, Card, SectionHeader, StatusNotice } from '../../components/ui';

export function TransporterRegisterFoundationPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F6FBFF] text-[#18364B]">
      <header className="bg-white border-b border-[#D2E7F4]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandWordmark size="md" />
          <Link
            to="/auth?role=transporter"
            className="min-h-[44px] px-3.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold text-[#18364B] hover:bg-[#E5F3FA]"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('auth.backToTransporterLogin')}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('auth.registerTitle')}
          subtitle={t('auth.registerSubtitle')}
        />

        <Card padding="lg" className="space-y-4">
          <StatusNotice
            tone="ice"
            icon={<Truck className="w-4 h-4" />}
            title={t('auth.truckOwnerBadge')}
            message={t('auth.errors.providerNotConfigured')}
          />
          <Link
            to="/auth?role=transporter"
            className="min-h-[48px] w-full rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('auth.backToTransporterLogin')}</span>
          </Link>
        </Card>
      </main>
    </div>
  );
}
