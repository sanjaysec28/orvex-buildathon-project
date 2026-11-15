import { IndianRupee, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../../components/layout/AppShell';
import { Card, SectionHeader } from '../../components/ui';
import { googleMapsContract } from '../../services/maps/mapsContract';
import { TRANSPORTER_NAV_ITEMS } from './transporterNav';

export function TransporterHomePage() {
  const { t } = useTranslation();
  const corridor = googleMapsContract.getPrimaryCorridor();

  const modules = [
    {
      id: 'profile-vehicles',
      icon: Truck,
      title: t('transporter.modules.profileVehicles.title'),
      summary: t('transporter.modules.profileVehicles.summary'),
    },
    {
      id: 'trips-return-loads',
      icon: MapPin,
      title: t('transporter.modules.tripsReturnLoads.title'),
      summary: t('transporter.modules.tripsReturnLoads.summary'),
    },
    {
      id: 'profitability-offers',
      icon: IndianRupee,
      title: t('transporter.modules.profitabilityOffers.title'),
      summary: t('transporter.modules.profitabilityOffers.summary'),
    },
    {
      id: 'bookings-tracking',
      icon: ShieldCheck,
      title: t('transporter.modules.bookingsTracking.title'),
      summary: t('transporter.modules.bookingsTracking.summary'),
    },
  ];

  return (
    <AppShell role="transporter" navItems={TRANSPORTER_NAV_ITEMS}>
      <div className="space-y-6">
        <Card padding="lg" tone="navy" className="space-y-2.5">
          <p className="text-xs font-semibold text-[var(--orvex-sky-blue)]">
            {t('brand.corridorValue')}
            <span aria-hidden="true"> · </span>
            <span className="font-mono tabular-nums">{corridor.corridorCode}</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--orvex-text-on-navy)]">
            {t('transporter.home.title')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--orvex-ice-blue)] leading-relaxed max-w-2xl">
            {t('transporter.home.objective')}
          </p>
        </Card>

        <section className="space-y-4">
          <SectionHeader
            title={t('transporter.home.modulesTitle')}
            subtitle={t('transporter.home.modulesSubtitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card key={mod.id} padding="md" className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-[var(--orvex-radius-control)] bg-[var(--orvex-surface-subtle)] border border-[var(--orvex-border-input)] text-[var(--orvex-text-primary)] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-[var(--orvex-text-muted)]">
                      {t('states.plannedPhaseTag')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--orvex-text-primary)]">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-[var(--orvex-text-secondary)] leading-relaxed">
                    {mod.summary}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
