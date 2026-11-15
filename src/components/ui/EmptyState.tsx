import type { ReactNode } from 'react';
import { Card } from './Card';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card padding="lg" className="text-center flex flex-col items-center">
      <div className="w-12 h-12 rounded-[var(--orvex-radius-card)] bg-[var(--orvex-surface-subtle)] border border-[var(--orvex-border-input)] text-[var(--orvex-text-primary)] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-[var(--orvex-text-base)] sm:text-[var(--orvex-text-lg)] font-bold text-[var(--orvex-text-primary)]">
        {title}
      </h3>
      <p className="mt-1.5 text-[var(--orvex-text-sm)] text-[var(--orvex-text-secondary)] max-w-md leading-relaxed">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
