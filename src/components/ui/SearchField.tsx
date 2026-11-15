import { Search, X } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface SearchFieldProps
  extends Omit<InputProps, 'type' | 'leadingIcon' | 'trailingAction'> {
  value: string;
  onValueChange: (value: string) => void;
  clearLabel: string;
}

export function SearchField({
  value,
  onValueChange,
  clearLabel,
  onChange,
  ...props
}: SearchFieldProps) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => {
        onValueChange(event.target.value);
        onChange?.(event);
      }}
      leadingIcon={<Search className="w-4 h-4" />}
      trailingAction={
        value ? (
          <button
            type="button"
            onClick={() => onValueChange('')}
            aria-label={clearLabel}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[var(--orvex-text-muted)] hover:text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-surface-subtle)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
}
