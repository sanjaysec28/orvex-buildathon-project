import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface StatusNoticeProps {
  title: string;
  message?: string;
  tone?: 'ice' | 'lemon';
  icon?: ReactNode;
  className?: string;
}

export function StatusNotice({
  title,
  message,
  tone = 'ice',
  icon,
  className,
}: StatusNoticeProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-[var(--orvex-radius-control)] px-4 py-3.5 border text-[var(--orvex-text-sm)]',
        tone === 'lemon'
          ? 'bg-[#C8F542]/25 border-[#B2DE2D] text-[var(--orvex-text-primary)]'
          : 'bg-[var(--orvex-surface-subtle)] border-[var(--orvex-border-input)] text-[var(--orvex-text-primary)]',
        className,
      )}
    >
      <span className="mt-0.5 shrink-0 text-[var(--orvex-text-primary)]" aria-hidden="true">
        {icon ?? <Info className="w-4 h-4" />}
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="font-semibold text-[var(--orvex-text-primary)]">{title}</p>
        {message ? (
          <p className="text-[var(--orvex-text-secondary)] leading-relaxed">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
