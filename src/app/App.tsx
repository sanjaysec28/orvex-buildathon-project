import { Suspense } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { LoadingState } from '../components/ui';
import { useDocumentDirection } from '../hooks/useDocumentDirection';
import { RoleProvider } from '../hooks/useRoleContext';
import i18n from '../i18n/config';
import { ErrorBoundary } from './ErrorBoundary';
import { AppRoutes } from './routes';

function AppContent() {
  const { t, i18n: activeI18n } = useTranslation();
  useDocumentDirection(activeI18n.language);

  return (
    <Suspense
      fallback={
        <LoadingState
          fullScreen
          title={t('states.loadingTitle')}
          message={t('states.loadingMessage')}
        />
      }
    >
      <AppRoutes />
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <RoleProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </RoleProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
