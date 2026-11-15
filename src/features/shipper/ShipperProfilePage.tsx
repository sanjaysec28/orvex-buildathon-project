import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState, SectionHeader } from '../../components/ui';
import { SHIPPER_NAV_ITEMS } from './shipperNav';

export function ShipperProfilePage() {
  const { t } = useTranslation();

  return (
    <AppShell role="shipper" navItems={SHIPPER_NAV_ITEMS}>
      <div className="space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('shipper.profile.title')}
          subtitle={t('shipper.profile.subtitle')}
        />
        <EmptyState
          icon={<Building2 className="w-6 h-6" aria-hidden="true" />}
          title={t('shipper.profile.emptyTitle')}
          description={t('shipper.profile.emptyBody')}
        />
      </div>
    </AppShell>
  );
}
