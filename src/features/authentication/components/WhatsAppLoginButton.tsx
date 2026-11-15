export interface WhatsAppLoginButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function WhatsAppLoginButton({
  label,
  onClick,
  disabled = false,
}: WhatsAppLoginButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full h-[50px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#9FD4F2] active:bg-[#F3FAFF] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2.5 shadow-[0_2px_8px_-2px_rgba(24,54,75,0.05)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[21px] h-[21px] shrink-0"
        aria-hidden="true"
      >
        <path
          fill="#25D366"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.78 1.21 5.46 0 9.91-4.45 9.91-9.91C21.94 6.45 17.5 2 12.04 2zm5.79 14.01c-.24.67-1.38 1.29-1.91 1.36-.49.07-1.12.1-1.8-.11-.42-.13-.95-.31-1.63-.6-2.86-1.24-4.73-4.12-4.87-4.31-.14-.19-1.16-1.55-1.16-2.96 0-1.41.73-2.1 1-2.38.26-.28.57-.35.76-.35.19 0 .38.01.55.02.18.01.41-.07.65.5.24.58.82 2.01.89 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.47-.14.17-.3.37-.43.5-.14.14-.29.3-.12.58.17.28.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.31 1.42.28.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.1 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.69-.17 1.36z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
