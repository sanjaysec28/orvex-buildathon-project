import { Calendar, Check, Clock, Copy, FileText } from 'lucide-react';
import { useState } from 'react';
import type { SubmittedShipperApplicationSummary } from '../shipperTypes';

export interface ShipperStep7SubmittedScreenProps {
  application: SubmittedShipperApplicationSummary;
  onViewApplication: () => void;
  onBackToLogin: () => void;
}

export function ShipperStep7SubmittedScreen({
  application,
  onViewApplication,
  onBackToLogin,
}: ShipperStep7SubmittedScreenProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(application.submittedAt));

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(application.applicationId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API may be restricted in sandboxed browsers
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between gap-5 pt-2">
      <div className="text-center">
        <div className="flex justify-center">
          <img
            src="/assets/orvex-submitted-clipboard.webp"
            alt=""
            aria-hidden="true"
            className="w-[150px] h-[150px] object-contain select-none pointer-events-none"
          />
        </div>

        <h1 className="mt-3 text-[24px] sm:text-[26px] font-bold tracking-tight text-[#18364B]">
          Application Submitted!
        </h1>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#3F5B6E] max-w-[330px] mx-auto">
          Your shipper account has been submitted successfully. We&apos;ll notify you once your verification is complete.
        </p>

        {/* Application summary card */}
        <div className="mt-5 rounded-[20px] bg-white border border-[#DCEAF4] p-4 shadow-[0_4px_16px_-4px_rgba(24,54,75,0.06)] text-start space-y-3.5">
          {/* Application ID row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#EEF6FC] text-[#18364B] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] text-[#5A7486]">Application ID</p>
                <p className="text-[14px] font-bold text-[#18364B] font-mono truncate">
                  {application.applicationId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyId}
              aria-label="Copy Application ID"
              className="min-h-[34px] px-2.5 rounded-lg text-[#1570EF] hover:bg-[#EAF5FC] inline-flex items-center gap-1 text-[11.5px] font-semibold cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <hr className="border-[#ECF3F8]" />

          {/* Submitted On row */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#EEF6FC] text-[#18364B] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11.5px] text-[#5A7486]">Submitted On</p>
              <p className="text-[14px] font-bold text-[#18364B]">{formattedDate}</p>
            </div>
          </div>

          <hr className="border-[#ECF3F8]" />

          {/* Verification Status row */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#FFF6DC] text-[#A46C00] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11.5px] text-[#5A7486]">Verification Status</p>
              <span className="inline-flex items-center mt-0.5 px-2.5 py-0.5 rounded-full bg-[#FFF2C6] text-[#6B4A00] text-[12px] font-bold">
                {application.verificationStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={onViewApplication}
          className="w-full h-[52px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] text-[#18364B] font-bold text-[15.5px] inline-flex items-center justify-center shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          View Application
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full h-[48px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center transition-colors cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
