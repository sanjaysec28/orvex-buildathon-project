import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BrandWordmark, Button, EmptyState } from '../components/ui';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F6FBFF] text-[#18364B] flex flex-col">
      <header className="bg-white border-b border-[#D2E7F4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <BrandWordmark size="md" />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={<Compass className="w-6 h-6" aria-hidden="true" />}
            title={t('states.notFoundTitle')}
            description={t('states.notFoundMessage')}
            action={
              <Button variant="primary" onClick={() => navigate('/')}>
                {t('states.goHome')}
              </Button>
            }
          />
        </div>
      </main>
    </div>
  );
}
