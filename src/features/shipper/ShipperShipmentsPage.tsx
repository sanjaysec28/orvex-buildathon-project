import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState, SectionHeader } from '../../components/ui';
import { SHIPPER_NAV_ITEMS } from './shipperNav';

export function ShipperShipmentsPage() {
  const { t } = useTranslation();

  return (
    <AppShell role="shipper" navItems={SHIPPER_NAV_ITEMS}>
      <div className="space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('shipper.shipments.title')}
          subtitle={t('shipper.shipments.subtitle')}
        />
        <EmptyState
          icon={<Package className="w-6 h-6" aria-hidden="true" />}
          title={t('shipper.shipments.emptyTitle')}
          description={t('shipper.shipments.emptyBody')}
        />
      </div>
    </AppShell>
  );
}
