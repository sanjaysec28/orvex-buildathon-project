import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type CardTone = 'default' | 'subtle' | 'navy';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const TONE_CLASSES: Record<CardTone, string> = {
  default:
    'bg-[var(--orvex-surface-card)] text-[var(--orvex-text-primary)] border border-[var(--orvex-border-subtle)] shadow-[var(--orvex-shadow-card)]',
  subtle:
    'bg-[var(--orvex-surface-subtle)] text-[var(--orvex-text-primary)] border border-[var(--orvex-border-input)]',
  navy:
    'bg-[var(--orvex-surface-navy)] text-[var(--orvex-text-on-navy)] border border-[var(--orvex-surface-navy)] shadow-[var(--orvex-shadow-card)]',
};

const PADDING_CLASSES = {
  sm: 'p-[var(--orvex-space-4)]',
  md: 'p-[var(--orvex-space-5)]',
  lg: 'p-[var(--orvex-space-6)]',
};

export function Card({
  tone = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--orvex-radius-card)]',
        TONE_CLASSES[tone],
        PADDING_CLASSES[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
