import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../hooks/useRoleContext';
import type { UserRole } from '../../types/domain';
import type { NavItemConfig } from '../../types/navigation';
import { getOppositeRole, getWorkspaceBasePath } from '../../utils/roleRouting';
import { LanguageSwitcherModal } from '../ui/LanguageSwitcherModal';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { PageContainer } from './PageContainer';
import { TopBar } from './TopBar';

export interface AppShellProps {
  role: UserRole;
  navItems: readonly NavItemConfig[];
  children: ReactNode;
}

export function AppShell({ role, navItems, children }: AppShellProps) {
  const { t } = useTranslation();
  const { setRole } = useRoleContext();
  const navigate = useNavigate();
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const workspaceLabel =
    role === 'transporter'
      ? t('roles.transporter.title')
      : t('roles.shipper.title');

  const handleSwitchRole = (nextRole: UserRole) => {
    setRole(nextRole);
  };

  const handleMobileSwitchRole = () => {
    const nextRole = getOppositeRole(role);
    setRole(nextRole);
    navigate(getWorkspaceBasePath(nextRole));
  };

  return (
    <div className="min-h-screen bg-[#F6FBFF] text-[#18364B] flex flex-col md:flex-row">
      <DesktopSidebar
        role={role}
        workspaceLabel={workspaceLabel}
        items={navItems}
        onSwitchRole={handleSwitchRole}
        onOpenLanguageSwitcher={() => setLanguageModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          workspaceLabel={workspaceLabel}
          onOpenLanguageSwitcher={() => setLanguageModalOpen(true)}
        />

        <main className="flex-1 pb-[76px] md:pb-8">
          <PageContainer>
            <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
              <button
                type="button"
                onClick={handleMobileSwitchRole}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#D2E7F4] text-xs font-semibold text-[#18364B] hover:bg-[#E5F3FA] cursor-pointer"
              >
                {t('roles.switchRole')}
                <span aria-hidden="true"> · </span>
                {getOppositeRole(role) === 'shipper'
                  ? t('roles.shipper.title')
                  : t('roles.transporter.title')}
              </button>
            </div>
            {children}
          </PageContainer>
        </main>

        <MobileBottomNav items={navItems} />
      </div>

      <LanguageSwitcherModal
        open={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
    </div>
  );
}
