import { cn } from '../../utils/cn';

export interface BrandWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandWordmark({ size = 'md', className }: BrandWordmarkProps) {
  const iconDimension = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textClass =
    size === 'sm'
      ? 'text-lg font-bold tracking-tight'
      : size === 'lg'
        ? 'text-2xl font-bold tracking-tight'
        : 'text-xl font-bold tracking-tight';

  return (
    <span className={cn('inline-flex items-center gap-2.5 whitespace-nowrap shrink-0', className)}>
      <span
        className={cn(
          'rounded-xl bg-[#18364B] flex items-center justify-center shrink-0',
          iconDimension,
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="#73CFFF" strokeWidth="2.4" />
          <path
            d="M8.5 12H15.5M15.5 12L12.75 9.25M15.5 12L12.75 14.75"
            stroke="#C8F542"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={cn(textClass, 'text-[#18364B]')}>ORVEX</span>
    </span>
  );
}
