import { UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState, SectionHeader } from '../../components/ui';
import { TRANSPORTER_NAV_ITEMS } from './transporterNav';

export function TransporterProfilePage() {
  const { t } = useTranslation();

  return (
    <AppShell role="transporter" navItems={TRANSPORTER_NAV_ITEMS}>
      <div className="space-y-6">
        <SectionHeader
          headingLevel="h1"
          title={t('transporter.profile.title')}
          subtitle={t('transporter.profile.subtitle')}
        />
        <EmptyState
          icon={<UserRound className="w-6 h-6" aria-hidden="true" />}
          title={t('transporter.profile.emptyTitle')}
          description={t('transporter.profile.emptyBody')}
        />
      </div>
    </AppShell>
  );
}
