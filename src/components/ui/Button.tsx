import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'positive' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--orvex-action-primary)] text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-action-primary-hover)] active:bg-[var(--orvex-action-primary-active)] border border-[var(--orvex-action-primary-hover)]',
  positive:
    'bg-[var(--orvex-action-positive)] text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-action-positive-hover)] active:bg-[var(--orvex-action-positive-active)] border border-[#B2DE2D]',
  secondary:
    'bg-[var(--orvex-action-secondary)] text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-action-secondary-hover)] active:bg-[#C6E1F1] border border-[var(--orvex-border-input)]',
  outline:
    'bg-[var(--orvex-surface-card)] text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-surface-canvas)] active:bg-[var(--orvex-surface-subtle)] border border-[var(--orvex-border-strong)]',
  ghost:
    'bg-transparent text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-surface-subtle)] active:bg-[var(--orvex-action-secondary-hover)] border border-transparent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-[var(--orvex-btn-height-md)] px-4 py-2.5 text-[var(--orvex-text-sm)]',
  lg: 'min-h-[var(--orvex-btn-height-lg)] px-5 py-3 text-[var(--orvex-text-base)]',
};

export function Button({
  ref,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--orvex-radius-control)] font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--orvex-border-focus)] focus-visible:outline-offset-2 disabled:opacity-[var(--orvex-disabled-opacity)] disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
}
