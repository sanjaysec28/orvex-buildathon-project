import {
  AlertCircle,
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  Truck,
  User,
  Users,
} from 'lucide-react';
import { type FormEvent } from 'react';
import {
  getDocumentRequirements,
  maskPan,
  normalizeIndianMobile,
  validateSubmittedApplicationPayload,
} from '../registrationValidation';
import type { TransporterRegistrationDraft } from '../registrationTypes';

export interface Step6ReviewApplicationScreenProps {
  draft: TransporterRegistrationDraft;
  isSubmitting: boolean;
  submitError: string | null;
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  onToggleDeclaration: (checked: boolean) => void;
  onOpenLegal: (topic: 'terms' | 'privacy') => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function Step6ReviewApplicationScreen({
  draft,
  isSubmitting,
  submitError,
  onEditStep,
  onToggleDeclaration,
  onOpenLegal,
  onBack,
  onSubmit,
}: Step6ReviewApplicationScreenProps) {
  const formattedMobile = normalizeIndianMobile(draft.account.mobileNumber) ?? draft.account.mobileNumber;
  const reqs = getDocumentRequirements(
    draft.transporterType,
    draft.companyDetails.constitution,
    draft.companyDetails.gstin,
  );

  const uploadedDocs = reqs
    .map((req) => {
      const meta = draft.documents[req.slotKey];
      return meta ? { title: req.title, status: meta.status } : null;
    })
    .filter((item): item is { title: string; status: 'Uploaded' } => item !== null);

  const allValidationErrors = validateSubmittedApplicationPayload(draft);
  const canSubmit = Object.keys(allValidationErrors).length === 0 && !isSubmitting;

  const ownerSummary =
    draft.transporterType === 'individual'
      ? `${draft.individualDetails.legalFullName} · PAN: ${maskPan(draft.individualDetails.panNumber)} · ${draft.individualDetails.city}, ${draft.individualDetails.state}`
      : `${draft.companyDetails.legalBusinessName} (${draft.companyDetails.constitution}) · PAN: ${maskPan(draft.companyDetails.companyPan)} · ${draft.companyDetails.city}, ${draft.companyDetails.state}`;

  const primaryDriver = draft.drivers.find((d) => d.isPrimary) ?? draft.drivers[0];
  const extraDriverCount = Math.max(0, draft.drivers.length - 1);
  const driverSummary = primaryDriver
    ? `${primaryDriver.fullName}${extraDriverCount > 0 ? ` + ${extraDriverCount} additional` : ''} (${draft.drivers.length} ${draft.drivers.length === 1 ? 'Driver' : 'Drivers'} Added)`
    : 'No driver added';

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-2.5">
        {/* Card 1: Account Information */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_2px_8px_-2px_rgba(24,54,75,0.04)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#E9F9EE] text-[#1D8E49] flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#18364B]">Account Information</p>
              <p className="text-[12px] text-[#4A6578] truncate">
                {draft.account.fullName} · {formattedMobile}
              </p>
              <p className="text-[11.5px] text-[#5A7486] truncate">{draft.account.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="px-2 py-1 text-[13px] font-semibold text-[#1570EF] hover:underline cursor-pointer shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Card 2: Transporter Type */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_2px_8px_-2px_rgba(24,54,75,0.04)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#E9F9EE] text-[#1D8E49] flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#18364B]">Transporter Type</p>
              <p className="text-[12px] text-[#4A6578]">
                {draft.transporterType === 'individual' ? 'Individual Owner' : 'Transport Company'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="px-2 py-1 text-[13px] font-semibold text-[#1570EF] hover:underline cursor-pointer shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Card 3: Owner / Business Details */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_2px_8px_-2px_rgba(24,54,75,0.04)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#E9F9EE] text-[#1D8E49] flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#18364B]">
                {draft.transporterType === 'individual' ? 'Owner Details' : 'Business Details'}
              </p>
              <p className="text-[12px] text-[#4A6578] leading-snug">{ownerSummary}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="px-2 py-1 text-[13px] font-semibold text-[#1570EF] hover:underline cursor-pointer shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Card 4: Driver Information */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_2px_8px_-2px_rgba(24,54,75,0.04)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#E9F9EE] text-[#1D8E49] flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#18364B]">Driver Information</p>
              <p className="text-[12px] text-[#4A6578] leading-snug">{driverSummary}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="px-2 py-1 text-[13px] font-semibold text-[#1570EF] hover:underline cursor-pointer shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Card 5: Documents */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_2px_8px_-2px_rgba(24,54,75,0.04)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#E9F9EE] text-[#1D8E49] flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#18364B]">Documents</p>
              <p className="text-[12px] text-[#4A6578]">
                {uploadedDocs.length} {uploadedDocs.length === 1 ? 'Document' : 'Documents'} Uploaded
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {uploadedDocs.map((doc) => (
                  <span
                    key={doc.title}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F1FBF6] border border-[#CBEAD7] text-[10.5px] font-semibold text-[#18864B]"
                  >
                    {doc.title} · {doc.status}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="px-2 py-1 text-[13px] font-semibold text-[#1570EF] hover:underline cursor-pointer shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Declaration Checkbox */}
        <div className="pt-1.5 px-1">
          <label className="inline-flex items-start gap-2.5 text-[12.5px] leading-snug text-[#18364B] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draft.declarationConfirmed}
              onChange={(e) => onToggleDeclaration(e.target.checked)}
              className="mt-0.5 w-[18px] h-[18px] rounded-[4px] border border-[#9BB6C9] accent-[#1C9CF0] cursor-pointer shrink-0"
            />
            <span>
              I confirm that the information provided is true and correct. I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('terms');
                }}
                className="font-semibold text-[#1570EF] underline underline-offset-2 cursor-pointer"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('privacy');
                }}
                className="font-semibold text-[#1570EF] underline underline-offset-2 cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>
        </div>

        {submitError ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#F5B5B5] bg-[#FEF3F2] px-3.5 py-2.5 text-[12.5px] text-[#B42318] flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="h-[50px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-[50px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] disabled:bg-[#E2EFE0] disabled:text-[#788D9C] disabled:cursor-not-allowed text-[#18364B] font-bold text-[14.5px] inline-flex items-center justify-center gap-1.5 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Application</span>
          )}
        </button>
      </div>
    </form>
  );
}
