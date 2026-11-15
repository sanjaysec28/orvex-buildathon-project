import { Route } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState, SectionHeader } from '../../components/ui';
import { TRANSPORTER_NAV_ITEMS } from './transporterNav';

export function TransporterTripsPage() {
  const { t } = useTranslation();

  return (
    <AppShell role="transporter" navItems={TRANSPORTER_NAV_ITEMS}>
      <div className="space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('transporter.trips.title')}
          subtitle={t('transporter.trips.subtitle')}
        />
        <EmptyState
          icon={<Route className="w-6 h-6" aria-hidden="true" />}
          title={t('transporter.trips.emptyTitle')}
          description={t('transporter.trips.emptyBody')}
        />
      </div>
    </AppShell>
  );
}
