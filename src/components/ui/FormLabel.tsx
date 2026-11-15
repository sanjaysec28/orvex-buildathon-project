import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  srOnly?: boolean;
}

export function FormLabel({
  htmlFor,
  children,
  required = false,
  srOnly = false,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        srOnly
          ? 'sr-only'
          : 'block text-[var(--orvex-text-sm)] font-semibold text-[var(--orvex-text-primary)] mb-1.5',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="ms-1 text-[var(--orvex-text-secondary)]" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
