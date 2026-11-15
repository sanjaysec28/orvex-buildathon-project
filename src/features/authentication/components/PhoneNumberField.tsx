import { Phone } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface PhoneNumberFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function PhoneNumberField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
}: PhoneNumberFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative flex items-center">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <Phone
          className="pointer-events-none absolute start-4 w-[18px] h-[18px] text-[#5A7486]"
          aria-hidden="true"
        />
        <input
          id={id}
          name="mobileNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={14}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full h-[50px] rounded-full bg-white ps-11 pe-5 text-[15px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_4px_rgba(24,54,75,0.03)] transition-colors focus:outline-none disabled:opacity-60',
            error
              ? 'border-[1.5px] border-[#D9383A] focus:border-[#D9383A]'
              : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
          )}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 ps-4 text-[12.5px] font-medium text-[#C62828]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
