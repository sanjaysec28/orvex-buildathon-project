import { CheckCircle2, ChevronDown, Trash2, UploadCloud } from 'lucide-react';
import { useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import type { UploadedDocumentMeta } from '../registrationTypes';

export interface WizardPillInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  icon: ReactNode;
  error?: string;
  rightAdornment?: ReactNode;
  compact?: boolean;
}

export function WizardPillInput({
  label,
  icon,
  error,
  rightAdornment,
  compact = false,
  id: providedId,
  className,
  ...rest
}: WizardPillInputProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-4 text-[#5A7486] flex items-center"
        >
          {icon}
        </span>

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-full bg-white text-[14.5px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_3px_rgba(24,54,75,0.03)] transition-colors focus:outline-none',
            compact ? 'h-[44px]' : 'h-[48px]',
            'ps-11',
            rightAdornment ? 'pe-28' : 'pe-4',
            error
              ? 'border-[1.5px] border-[#D9383A] focus:border-[#D9383A]'
              : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
            className,
          )}
          {...rest}
        />

        {rightAdornment ? (
          <div className="absolute end-1.5 flex items-center">{rightAdornment}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 ps-4 text-[12px] font-medium text-[#C62828]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface WizardPillSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  id?: string;
  compact?: boolean;
}

export function WizardPillSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
  error,
  id: providedId,
  compact = false,
}: WizardPillSelectProps) {
  const generatedId = useId();
  const selectId = providedId ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div>
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute start-4 text-[#5A7486] flex items-center"
          >
            {icon}
          </span>
        ) : null}

        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full appearance-none rounded-full bg-white text-[14px] shadow-[0_1px_3px_rgba(24,54,75,0.03)] transition-colors focus:outline-none pe-9 cursor-pointer',
            compact ? 'h-[44px]' : 'h-[48px]',
            icon ? 'ps-11' : 'ps-4',
            value ? 'text-[#18364B]' : 'text-[#6E8696]',
            error
              ? 'border-[1.5px] border-[#D9383A] focus:border-[#D9383A]'
              : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
          )}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute end-3.5 w-4 h-4 text-[#5A7486]"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 ps-4 text-[12px] font-medium text-[#C62828]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface DocumentUploadDropzoneProps {
  title: string;
  formatsLabel: string;
  accept: string;
  document?: UploadedDocumentMeta | null;
  progress?: number;
  error?: string;
  onFileSelected: (file: File) => void;
  onRemove?: () => void;
}

export function DocumentUploadDropzone({
  title,
  formatsLabel,
  accept,
  document,
  progress,
  error,
  onFileSelected,
  onRemove,
}: DocumentUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
          event.target.value = '';
        }}
      />

      {document ? (
        <div className="rounded-2xl border border-[#8FD4B6] bg-[#F1FBF6] px-3.5 py-2.5 flex items-center justify-between gap-2.5">
          <div className="min-w-0 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#18864B] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#18364B] truncate">{title}</p>
              <p className="text-[12px] text-[#3F5B6E] truncate">
                {document.fileName} · {Math.max(1, Math.round(document.sizeBytes / 1024))} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-full bg-white border border-[#DCEAF4] text-[12px] font-semibold text-[#1570EF] hover:bg-[#E5F3FA] cursor-pointer"
            >
              Replace
            </button>
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${title}`}
                className="w-8 h-8 rounded-full bg-white border border-[#DCEAF4] text-[#C62828] hover:bg-[#FEF3F2] flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full rounded-2xl border border-dashed bg-white px-3.5 py-3 flex items-center gap-3 text-start transition-colors cursor-pointer hover:bg-[#F5FAFF]',
            error ? 'border-[#D9383A]' : 'border-[#B6D4E8]',
          )}
        >
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[#EAF5FC] text-[#18364B] flex items-center justify-center shrink-0"
          >
            <UploadCloud className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-[#18364B] truncate">{title}</p>
            <p className="text-[11.5px] text-[#5A7486]">{formatsLabel}</p>
          </div>
        </button>
      )}

      {typeof progress === 'number' ? (
        <div className="mt-1.5 px-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#1570EF] mb-0.5">
            <span>Uploading privately...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#DCEAF4] overflow-hidden">
            <div
              className="h-full bg-[#1C9CF0] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-1 ps-3 text-[12px] font-medium text-[#C62828]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
