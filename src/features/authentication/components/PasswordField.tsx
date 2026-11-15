import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../utils/cn';

export interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function PasswordField({
  id,
  label,
  placeholder,
  showPasswordLabel,
  hidePasswordLabel,
  value,
  onChange,
  error,
  disabled = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative flex items-center">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <Lock
          className="pointer-events-none absolute start-4 w-[18px] h-[18px] text-[#5A7486]"
          aria-hidden="true"
        />
        <input
          id={id}
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full h-[50px] rounded-full bg-white ps-11 pe-12 text-[15px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_4px_rgba(24,54,75,0.03)] transition-colors focus:outline-none disabled:opacity-60',
            error
              ? 'border-[1.5px] border-[#D9383A] focus:border-[#D9383A]'
              : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
          )}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          aria-pressed={visible}
          className="absolute end-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#3F5B6E] hover:text-[#18364B] hover:bg-[#E5F3FA] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] disabled:opacity-50"
        >
          {visible ? (
            <Eye className="w-[18px] h-[18px]" aria-hidden="true" />
          ) : (
            <EyeOff className="w-[18px] h-[18px]" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 ps-4 text-[12.5px] font-medium text-[#C62828]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
