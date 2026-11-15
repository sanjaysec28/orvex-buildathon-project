import { cn } from '../../../utils/cn';

export interface OrvexWordmarkProps {
  variant?: 'dark-bg' | 'light-bg';
  compact?: boolean;
  className?: string;
}

export function OrvexWordmark({
  variant = 'light-bg',
  compact = false,
  className,
}: OrvexWordmarkProps) {
  const baseTextColor = variant === 'dark-bg' ? 'text-white' : 'text-[#18364B]';

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#13324D] border border-white/15 shrink-0',
          className,
        )}
      >
        <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M6.5 6.5L14 14M14 14L21.5 21.5"
            stroke="#C8F542"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M21.5 6.5L6.5 21.5"
            stroke="#73CFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-extrabold tracking-[-0.03em] text-[24px] leading-none select-none',
        baseTextColor,
        className,
      )}
    >
      <span>ORVE</span>
      <span className="relative inline-flex items-center justify-center w-[22px] h-[22px] ml-0.5">
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" aria-hidden="true">
          <path
            d="M4.5 4.5L19.5 19.5"
            stroke={variant === 'dark-bg' ? '#FFFFFF' : '#18364B'}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M19.5 4.5L10.8 13.2"
            stroke="#73CFFF"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M11.6 12.4L4.5 19.5"
            stroke="#C8F542"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}
