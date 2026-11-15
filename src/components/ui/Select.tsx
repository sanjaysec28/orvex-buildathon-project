import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { FormLabel } from './FormLabel';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hideLabel?: boolean;
  options: readonly SelectOption[];
  placeholderOption?: string;
  helperText?: string;
  errorText?: string;
}

export function Select({
  id,
  label,
  hideLabel = false,
  options,
  placeholderOption,
  helperText,
  errorText,
  required = false,
  disabled = false,
  className,
  ...props
}: SelectProps) {
  const describedById = errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className="w-full">
      <FormLabel htmlFor={id} required={required} srOnly={hideLabel}>
        {label}
      </FormLabel>
      <div className="relative flex items-center">
        <select
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            'w-full min-h-[var(--orvex-input-height)] appearance-none rounded-[var(--orvex-radius-control)] bg-[var(--orvex-surface-card)] border text-[var(--orvex-text-primary)] text-[var(--orvex-text-base)] ps-3.5 pe-10 transition-colors duration-150 focus:outline-none focus:shadow-[var(--orvex-focus-ring)] disabled:opacity-[var(--orvex-disabled-opacity)] disabled:bg-[var(--orvex-surface-subtle)] disabled:cursor-not-allowed',
            errorText
              ? 'border-[var(--orvex-border-error)] focus:border-[var(--orvex-border-error)]'
              : 'border-[var(--orvex-border-input)] focus:border-[var(--orvex-border-focus)]',
            className,
          )}
          {...props}
        >
          {placeholderOption ? (
            <option value="" disabled>
              {placeholderOption}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3.5 w-4 h-4 text-[var(--orvex-text-muted)]"
          aria-hidden="true"
        />
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
