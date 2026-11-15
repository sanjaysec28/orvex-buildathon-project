import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../components/ui';

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F6FBFF] text-[#18364B] flex items-center justify-center p-4">
      <Card padding="lg" className="max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E5F3FA] text-[#18364B] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-[#18364B]">
            {t('states.errorTitle')}
          </h1>
          <p className="text-sm text-[#3F5B6E] leading-relaxed">
            {t('states.errorMessage')}
          </p>
        </div>
        <Button variant="primary" fullWidth onClick={onReset}>
          {t('states.retry')}
        </Button>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ORVEX ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
