import { ArrowLeft, ArrowRight, Building2, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { BrandWordmark, Button, Card, SectionHeader } from '../../components/ui';
import { useRoleContext } from '../../hooks/useRoleContext';
import { getWorkspaceBasePath } from '../../utils/roleRouting';

export function RoleSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setRole } = useRoleContext();

  const enterWorkspace = (selectedRole: 'transporter' | 'shipper') => {
    setRole(selectedRole);
    navigate(getWorkspaceBasePath(selectedRole));
  };

  return (
    <div className="min-h-screen bg-[var(--orvex-surface-canvas)] text-[var(--orvex-text-primary)]">
      <header className="bg-[var(--orvex-surface-card)] border-b border-[var(--orvex-border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <BrandWordmark size="md" />
          <Link
            to="/language"
            className="min-h-[var(--orvex-touch-min)] px-3.5 rounded-[var(--orvex-radius-control)] inline-flex items-center gap-2 text-sm font-semibold text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-surface-subtle)] transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
            <span>{t('nav.languageEntry')}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('roles.sectionTitle')}
          subtitle={t('roles.sectionSubtitle')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="lg" className="flex flex-col justify-between gap-5">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-[var(--orvex-radius-control)] bg-[#73CFFF]/30 border border-[#73CFFF] flex items-center justify-center text-[var(--orvex-text-primary)]">
                <Truck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[var(--orvex-text-primary)]">
                {t('roles.transporter.title')}
              </h2>
              <p className="text-sm text-[var(--orvex-text-secondary)] leading-relaxed">
                {t('roles.transporter.subtitle')}
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              onClick={() => enterWorkspace('transporter')}
            >
              {t('roles.transporter.cta')}
            </Button>
          </Card>

          <Card padding="lg" className="flex flex-col justify-between gap-5">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-[var(--orvex-radius-control)] bg-[#C8F542]/45 border border-[#B2DE2D] flex items-center justify-center text-[var(--orvex-text-primary)]">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[var(--orvex-text-primary)]">
                {t('roles.shipper.title')}
              </h2>
              <p className="text-sm text-[var(--orvex-text-secondary)] leading-relaxed">
                {t('roles.shipper.subtitle')}
              </p>
            </div>
            <Button
              variant="positive"
              size="lg"
              fullWidth
              icon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              onClick={() => enterWorkspace('shipper')}
            >
              {t('roles.shipper.cta')}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
