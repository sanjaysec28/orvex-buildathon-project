import { ArrowLeft, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export const STEP_PROGRESS_PERCENT: Record<1 | 2 | 3 | 4 | 5 | 6, number> = {
  1: 16,
  2: 33,
  3: 50,
  4: 66,
  5: 83,
  6: 100,
};

export interface RegistrationShellProps {
  step?: 1 | 2 | 3 | 4 | 5 | 6;
  heading?: string;
  subtitle?: string;
  onBack?: () => void;
  backAriaLabel?: string;
  children: ReactNode;
}

export function RegistrationShell({
  step,
  heading,
  subtitle,
  onBack,
  backAriaLabel = 'Go back',
  children,
}: RegistrationShellProps) {
  const progressPercent = step ? STEP_PROGRESS_PERCENT[step] : null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-[#EAF6FF] via-[#F6FBFF] to-[#F6FBFF] text-[#18364B] flex flex-col">
      {/* Subtle ORVEX corner shapes & bottom curved footer */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 140"
        className="pointer-events-none fixed top-14 sm:top-4 start-0 w-9 sm:w-20 h-auto text-[#C8F542]/75"
        fill="currentColor"
      >
        <path d="M0,0 L34,0 C52,32 76,62 96,90 C62,74 30,48 0,18 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none fixed top-24 sm:top-20 end-0 w-9 sm:w-20 h-auto text-[#73CFFF]/50"
        fill="currentColor"
      >
        <path d="M120,0 C84,12 52,36 32,74 C66,60 94,48 120,42 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        className="pointer-events-none fixed bottom-0 inset-x-0 w-full h-9 sm:h-11 z-0"
      >
        <path d="M0,18 C65,24 115,46 168,70 L0,70 Z" fill="#73CFFF" />
        <path d="M150,70 C245,42 330,18 400,8 L400,70 Z" fill="#C8F542" />
      </svg>

      <div className="relative z-10 flex-1 w-full max-w-[460px] mx-auto px-4 sm:px-6 pt-3.5 sm:pt-5 pb-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.5rem))] flex flex-col">
        {/* Top bar with optional Back arrow and centred ORVEX logo */}
        <header className="shrink-0">
          <div className="relative flex items-center justify-center h-11">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={backAriaLabel}
                className="absolute start-0 min-h-[40px] min-w-[40px] -ms-2 rounded-full flex items-center justify-center text-[#18364B] hover:bg-[#E5F3FA] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B]"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
            ) : null}

            <div dir="ltr" className="inline-flex items-center justify-center" aria-label="ORVEX">
              <svg viewBox="0 0 142 38" className="h-7 sm:h-8 w-auto" role="img" aria-label="ORVEX">
                <text
                  x="4"
                  y="30"
                  fill="#18364B"
                  fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  fontWeight="800"
                  fontSize="32"
                  letterSpacing="-0.03em"
                >
                  ORVE
                </text>
                <path
                  d="M97 6 L112 20 L97 32 L104 32 L115 22 L125 32 L133 32 L119 19 L132 6 L125 6 L115 16 L105 6 Z"
                  fill="#18364B"
                />
                <path d="M97 6 L112 20 L115 17 L105 6 Z" fill="#C8F542" />
                <path d="M132 6 L114 23 L104 32 L111 32 L121 21 L132 6 Z" fill="#73CFFF" />
              </svg>
            </div>
          </div>

          {/* Step progress bar (Screens 1–6 only) */}
          {step && progressPercent !== null ? (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[13px] text-[#18364B] mb-1.5">
                <span className="font-semibold">Step {step} of 6</span>
                <span className="font-bold">{progressPercent}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Registration progress: Step ${step} of 6 (${progressPercent}%)`}
                className="w-full h-2 rounded-full bg-[#DCEAF4] overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-[#BCE934] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {heading ? (
            <div className="mt-3.5 text-center">
              <h1 className="text-[23px] sm:text-[25px] font-bold tracking-tight leading-tight text-[#18364B]">
                {heading}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#3F5B6E]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
        </header>

        <main className="flex-1 mt-4 flex flex-col">{children}</main>
      </div>
    </div>
  );
}

export function LegalPolicyModal({
  topic,
  onClose,
}: {
  topic: 'terms' | 'privacy' | null;
  onClose: () => void;
}) {
  if (!topic) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-policy-title"
      className="fixed inset-0 z-50 bg-[#18364B]/45 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#DCEAF4] p-5 shadow-xl space-y-3 text-[#18364B]">
        <div className="flex items-center justify-between gap-3">
          <h2 id="legal-policy-title" className="text-lg font-bold">
            {topic === 'terms' ? 'ORVEX Terms of Service' : 'ORVEX Privacy Policy'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close policy notice"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E5F3FA] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#3F5B6E] leading-relaxed">
          {topic === 'terms'
            ? 'By registering as a Transporter on ORVEX, you confirm that all vehicle, business, and driver details submitted are accurate and authorised. Freight booking access remains restricted until application verification is completed.'
            : 'ORVEX stores KYC and driver verification documents in private server storage for verification review only. Sensitive document files are never exposed via public URLs, and plaintext passwords or OTP codes are never stored in registration drafts.'}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-full bg-[#C8F542] hover:bg-[#BCE934] font-bold text-sm text-[#18364B] cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function useLegalPolicyModal() {
  const [policyTopic, setPolicyTopic] = useState<'terms' | 'privacy' | null>(null);
  return { policyTopic, setPolicyTopic };
}
