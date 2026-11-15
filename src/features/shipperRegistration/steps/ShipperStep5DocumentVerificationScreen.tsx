import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileBadge2,
  FileText,
  Home,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { cn } from '../../../utils/cn';
import type {
  AddressProofType,
  IdentityProofType,
} from '../../registration/registrationTypes';
import {
  getShipperDocumentRequirements,
  validateShipperDocumentsStep,
} from '../shipperValidation';
import type {
  ShipperDocumentSlotKey,
  ShipperRegistrationDraft,
} from '../shipperTypes';

export interface ShipperStep5DocumentVerificationScreenProps {
  draft: ShipperRegistrationDraft;
  uploadProgress: Partial<Record<ShipperDocumentSlotKey, number>>;
  uploadErrors: Partial<Record<ShipperDocumentSlotKey, string>>;
  onChangeIdentityProofType: (type: IdentityProofType) => void;
  onChangeAddressProofType: (type: AddressProofType) => void;
  onUploadDocument: (
    slotKey: ShipperDocumentSlotKey,
    file: File,
    proofSubType?: string,
  ) => void;
  onRemoveDocument: (slotKey: ShipperDocumentSlotKey) => void;
  onBack: () => void;
  onContinue: () => void;
}

const IDENTITY_PROOF_OPTIONS: readonly IdentityProofType[] = [
  'Voter ID',
  'Passport',
  'Driving Licence',
  'Aadhaar (Voluntary)',
];

const ADDRESS_PROOF_OPTIONS: readonly AddressProofType[] = [
  'Utility Bill',
  'Rent Agreement',
  'Bank Statement',
  'Others',
];

function iconForSlot(slotKey: ShipperDocumentSlotKey) {
  switch (slotKey) {
    case 'panCard':
      return <CreditCard className="w-5 h-5" />;
    case 'addressProof':
      return <Home className="w-5 h-5" />;
    case 'gstCertificate':
      return <FileBadge2 className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
}

export function ShipperStep5DocumentVerificationScreen({
  draft,
  uploadProgress,
  uploadErrors,
  onChangeIdentityProofType,
  onChangeAddressProofType,
  onUploadDocument,
  onRemoveDocument,
  onBack,
  onContinue,
}: ShipperStep5DocumentVerificationScreenProps) {
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const inputRefs = useRef<Partial<Record<ShipperDocumentSlotKey, HTMLInputElement | null>>>({});

  const gstin =
    draft.businessType === 'company'
      ? draft.companyDetails.gstin
      : draft.individualDetails.gstin;
  const requirements = getShipperDocumentRequirements(
    draft.businessType,
    draft.companyDetails.constitution,
    draft.individualDetails.panNumber,
    gstin,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = validateShipperDocumentsStep(draft);
    if (Object.keys(missing).length > 0) {
      setStepErrors(missing);
      return;
    }
    setStepErrors({});
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {requirements.map((req) => {
          const uploadedDoc = draft.documents[req.slotKey];
          const progress = uploadProgress[req.slotKey];
          const errorMsg = uploadErrors[req.slotKey] ?? stepErrors[req.slotKey];
          const subTypeValue =
            req.supportsSubType === 'identity'
              ? draft.identityProofType
              : req.supportsSubType === 'address'
                ? draft.addressProofType
                : undefined;

          return (
            <div
              key={req.slotKey}
              data-doc-slot={req.slotKey}
              className={cn(
                'rounded-[18px] bg-white p-3.5 shadow-[0_2px_10px_-2px_rgba(24,54,75,0.05)] transition-colors',
                errorMsg
                  ? 'border-[1.5px] border-[#D9383A]'
                  : uploadedDoc
                    ? 'border border-[#8FD4B6]'
                    : 'border border-[#DCEAF4]',
              )}
            >
              <input
                ref={(el) => {
                  inputRefs.current[req.slotKey] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="sr-only"
                aria-label={`Upload ${req.title}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setStepErrors((prev) => {
                      const next = { ...prev };
                      delete next[req.slotKey];
                      return next;
                    });
                    onUploadDocument(req.slotKey, file, subTypeValue);
                  }
                  e.target.value = '';
                }}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5',
                      uploadedDoc
                        ? 'bg-[#E9F9EE] text-[#18864B]'
                        : 'bg-[#EEF6FC] text-[#18364B]',
                    )}
                  >
                    {uploadedDoc ? <CheckCircle2 className="w-5 h-5" /> : iconForSlot(req.slotKey)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <h2 className="text-[14.5px] font-bold text-[#18364B] leading-snug">
                        {req.title}
                      </h2>
                      {!req.required ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF6FA] text-[#526B7D] text-[10.5px] font-semibold">
                          Optional
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[12px] text-[#4A6578] leading-snug mt-0.5">
                      {req.subtitle}
                    </p>
                    <p className="text-[11px] text-[#6E8696] mt-0.5">
                      {req.acceptedFormatsLabel}
                    </p>
                  </div>
                </div>

                {!uploadedDoc ? (
                  <button
                    type="button"
                    onClick={() => inputRefs.current[req.slotKey]?.click()}
                    aria-label={`Select file for ${req.title}`}
                    className="w-10 h-10 rounded-xl bg-[#EAF5FC] hover:bg-[#D8EEFB] text-[#1570EF] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <Upload className="w-[18px] h-[18px]" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              {req.supportsSubType === 'identity' ? (
                <div className="mt-2.5 ps-13">
                  <label
                    htmlFor={`shp-subtype-${req.slotKey}`}
                    className="block text-[11px] font-semibold text-[#5A7486] mb-1"
                  >
                    Identity Document Type
                  </label>
                  <select
                    id={`shp-subtype-${req.slotKey}`}
                    value={draft.identityProofType}
                    onChange={(e) =>
                      onChangeIdentityProofType(e.target.value as IdentityProofType)
                    }
                    className="w-full h-9 rounded-full bg-[#F6FBFF] border border-[#DCEAF4] px-3 text-[12.5px] font-medium text-[#18364B] focus:outline-none focus:border-[#38B6FF]"
                  >
                    {IDENTITY_PROOF_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {req.supportsSubType === 'address' ? (
                <div className="mt-2.5 ps-13">
                  <label
                    htmlFor={`shp-subtype-${req.slotKey}`}
                    className="block text-[11px] font-semibold text-[#5A7486] mb-1"
                  >
                    Address Document Type
                  </label>
                  <select
                    id={`shp-subtype-${req.slotKey}`}
                    value={draft.addressProofType}
                    onChange={(e) =>
                      onChangeAddressProofType(e.target.value as AddressProofType)
                    }
                    className="w-full h-9 rounded-full bg-[#F6FBFF] border border-[#DCEAF4] px-3 text-[12.5px] font-medium text-[#18364B] focus:outline-none focus:border-[#38B6FF]"
                  >
                    {ADDRESS_PROOF_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {uploadedDoc ? (
                <div className="mt-2.5 rounded-xl bg-[#F4FBF7] border border-[#CBEAD7] px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#18364B] truncate">
                      {uploadedDoc.fileName}
                    </p>
                    <p className="text-[11px] text-[#18864B] font-semibold">
                      Uploaded · Private storage
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => inputRefs.current[req.slotKey]?.click()}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#DCEAF4] text-[11.5px] font-semibold text-[#1570EF] hover:bg-[#E5F3FA] cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveDocument(req.slotKey)}
                      aria-label={`Remove ${req.title}`}
                      className="w-7 h-7 rounded-full bg-white border border-[#DCEAF4] text-[#C62828] hover:bg-[#FEF3F2] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}

              {!uploadedDoc && typeof progress === 'number' ? (
                <div className="mt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-[#1570EF] mb-0.5">
                    <span>Uploading to private vault...</span>
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

              {errorMsg ? (
                <p role="alert" className="mt-2 text-[12px] font-medium text-[#C62828]">
                  {errorMsg}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="rounded-2xl border border-[#DCEAF4] bg-[#EEF7FD] px-3.5 py-2.5 text-[12px] text-[#3F5B6E] flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Documents are saved privately for verification review. Uploading does not automatically mark your account or documents as Verified.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-[50px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="h-[50px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
