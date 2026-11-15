import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  headingLevel = 'h2',
  className,
}: SectionHeaderProps) {
  const HeadingTag = headingLevel;
  const headingClass =
    headingLevel === 'h1'
      ? 'text-2xl sm:text-3xl font-bold tracking-tight text-[#18364B]'
      : 'text-lg sm:text-xl font-bold tracking-tight text-[#18364B]';

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0 space-y-1">
        <HeadingTag className={headingClass}>
          {title}
        </HeadingTag>
        {subtitle ? (
          <p className="text-sm text-[#3F5B6E] leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
