import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  title: string;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  title,
  message,
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        fullScreen && 'min-h-screen bg-[var(--orvex-surface-canvas)]',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-[var(--orvex-radius-card)] bg-[var(--orvex-surface-subtle)] border border-[var(--orvex-border-input)] flex items-center justify-center mb-4">
        <Loader2
          className="w-6 h-6 text-[var(--orvex-text-primary)] animate-spin"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-[var(--orvex-text-base)] font-bold text-[var(--orvex-text-primary)]">
        {title}
      </h2>
      {message ? (
        <p className="mt-1 text-[var(--orvex-text-sm)] text-[var(--orvex-text-secondary)] max-w-sm">
          {message}
        </p>
      ) : null}
    </div>
  );
}
