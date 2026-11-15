export interface AuthDividerProps {
  label: string;
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3 px-2" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-[#D6E4EE]" aria-hidden="true" />
      <span className="text-[13px] font-medium text-[#526B7D] select-none">{label}</span>
      <span className="h-px flex-1 bg-[#D6E4EE]" aria-hidden="true" />
    </div>
  );
}
