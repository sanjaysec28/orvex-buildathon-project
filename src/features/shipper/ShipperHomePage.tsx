import { Building2, PackageCheck, Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../../components/layout/AppShell';
import { Card, SectionHeader } from '../../components/ui';
import { googleMapsContract } from '../../services/maps/mapsContract';
import { SHIPPER_NAV_ITEMS } from './shipperNav';

export function ShipperHomePage() {
  const { t } = useTranslation();
  const corridor = googleMapsContract.getPrimaryCorridor();

  const modules = [
    {
      id: 'business-profile',
      icon: Building2,
      title: t('shipper.modules.businessProfile.title'),
      summary: t('shipper.modules.businessProfile.summary'),
    },
    {
      id: 'shipment-creation',
      icon: PackageCheck,
      title: t('shipper.modules.shipmentCreation.title'),
      summary: t('shipper.modules.shipmentCreation.summary'),
    },
    {
      id: 'vehicle-discovery',
      icon: Search,
      title: t('shipper.modules.vehicleDiscovery.title'),
      summary: t('shipper.modules.vehicleDiscovery.summary'),
    },
    {
      id: 'bookings-tracking',
      icon: ShieldCheck,
      title: t('shipper.modules.bookingsTracking.title'),
      summary: t('shipper.modules.bookingsTracking.summary'),
    },
  ];

  return (
    <AppShell role="shipper" navItems={SHIPPER_NAV_ITEMS}>
      <div className="space-y-6">
        <Card padding="lg" tone="subtle" className="space-y-2.5 border-[var(--orvex-border-strong)]">
          <p className="text-xs font-semibold text-[var(--orvex-text-secondary)]">
            {t('brand.corridorValue')}
            <span aria-hidden="true"> · </span>
            <span className="font-mono tabular-nums">{corridor.corridorCode}</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--orvex-text-primary)]">
            {t('shipper.home.title')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--orvex-text-secondary)] leading-relaxed max-w-2xl">
            {t('shipper.home.objective')}
          </p>
        </Card>

        <section className="space-y-4">
          <SectionHeader
            title={t('shipper.home.modulesTitle')}
            subtitle={t('shipper.home.modulesSubtitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card key={mod.id} padding="md" className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-[var(--orvex-radius-control)] bg-[#C8F542]/45 border border-[#B2DE2D] text-[var(--orvex-text-primary)] flex items-center justify-center shrink-0">
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
