import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { FormLabel } from './FormLabel';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hideLabel?: boolean;
  helperText?: string;
  errorText?: string;
  leadingIcon?: ReactNode;
  trailingAction?: ReactNode;
}

export function Input({
  id,
  label,
  hideLabel = false,
  helperText,
  errorText,
  leadingIcon,
  trailingAction,
  required = false,
  disabled = false,
  className,
  ...props
}: InputProps) {
  const describedById = errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className="w-full">
      <FormLabel htmlFor={id} required={required} srOnly={hideLabel}>
        {label}
      </FormLabel>
      <div className="relative flex items-center">
        {leadingIcon ? (
          <span
            className="pointer-events-none absolute start-3.5 text-[var(--orvex-text-muted)]"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            'w-full min-h-[var(--orvex-input-height)] rounded-[var(--orvex-radius-control)] bg-[var(--orvex-surface-card)] border text-[var(--orvex-text-primary)] placeholder:text-[var(--orvex-text-muted)] text-[var(--orvex-text-base)] transition-colors duration-150 focus:outline-none focus:shadow-[var(--orvex-focus-ring)] disabled:opacity-[var(--orvex-disabled-opacity)] disabled:bg-[var(--orvex-surface-subtle)] disabled:cursor-not-allowed',
            errorText
              ? 'border-[var(--orvex-border-error)] focus:border-[var(--orvex-border-error)]'
              : 'border-[var(--orvex-border-input)] focus:border-[var(--orvex-border-focus)]',
            leadingIcon ? 'ps-10' : 'ps-3.5',
            trailingAction ? 'pe-12' : 'pe-3.5',
            className,
          )}
          {...props}
        />
        {trailingAction ? (
          <div className="absolute end-1.5 flex items-center">{trailingAction}</div>
        ) : null}
      </div>
      {errorText ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[var(--orvex-border-error)]">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1.5 text-xs text-[var(--orvex-text-secondary)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
