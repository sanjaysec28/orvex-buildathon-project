import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  FileBadge2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  DocumentUploadDropzone,
  WizardPillInput,
  WizardPillSelect,
} from '../components/RegistrationInputs';
import { INDIAN_STATES_CITIES, getCitiesForState } from '../indianLocations';
import {
  companyRequiresAuthorisation,
  validateOwnerDetailsStep,
} from '../registrationValidation';
import type {
  BusinessConstitution,
  CompanyDetailsData,
  DocumentSlotKey,
  IndividualOwnerDetailsData,
  TransporterRegistrationDraft,
} from '../registrationTypes';

export interface Step3OwnerDetailsScreenProps {
  draft: TransporterRegistrationDraft;
  uploadProgress: Partial<Record<DocumentSlotKey, number>>;
  uploadErrors: Partial<Record<DocumentSlotKey, string>>;
  onUpdateIndividual: (patch: Partial<IndividualOwnerDetailsData>) => void;
  onUpdateCompany: (patch: Partial<CompanyDetailsData>) => void;
  onUploadDocument: (slotKey: DocumentSlotKey, file: File) => void;
  onRemoveDocument: (slotKey: DocumentSlotKey) => void;
  onBack: () => void;
  onContinue: () => void;
}

const CONSTITUTION_OPTIONS: ReadonlyArray<{ value: BusinessConstitution; label: string }> = [
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'LLP', label: 'LLP' },
  { value: 'Private Limited', label: 'Private Limited' },
  { value: 'Public Limited', label: 'Public Limited' },
  { value: 'Other', label: 'Other' },
];

export function Step3OwnerDetailsScreen({
  draft,
  uploadProgress,
  uploadErrors,
  onUpdateIndividual,
  onUpdateCompany,
  onUploadDocument,
  onRemoveDocument,
  onBack,
  onContinue,
}: Step3OwnerDetailsScreenProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeState =
    draft.transporterType === 'individual'
      ? draft.individualDetails.state
      : draft.companyDetails.state;
  const availableCities = getCitiesForState(activeState);

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateOwnerDetailsStep(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onContinue();
  };

  const stateOptions = INDIAN_STATES_CITIES.map((entry) => ({
    value: entry.state,
    label: entry.state,
  }));

  const cityOptions = availableCities.map((city) => ({
    value: city,
    label: city,
  }));

  return (
    <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-2.5">
        {draft.transporterType === 'individual' ? (
          <>
            <WizardPillInput
              label="Legal Full Name"
              placeholder="Full Legal Name"
              icon={<User className="w-[18px] h-[18px]" />}
              value={draft.individualDetails.legalFullName}
              onChange={(e) => {
                clearError('legalFullName');
                onUpdateIndividual({ legalFullName: e.target.value });
              }}
              error={errors.legalFullName}
            />

            <div>
              <label htmlFor="ind-dob" className="block text-[12px] font-semibold text-[#3F5B6E] ps-3 mb-1">
                Date of Birth
              </label>
              <WizardPillInput
                id="ind-dob"
                label="Date of Birth"
                type="date"
                icon={<Calendar className="w-[18px] h-[18px]" />}
                value={draft.individualDetails.dateOfBirth}
                onChange={(e) => {
                  clearError('dateOfBirth');
                  onUpdateIndividual({ dateOfBirth: e.target.value });
                }}
                error={errors.dateOfBirth}
              />
            </div>

            <WizardPillInput
              label="PAN Number"
              placeholder="PAN Number (e.g., ABCDE1234F)"
              maxLength={10}
              icon={<CreditCard className="w-[18px] h-[18px]" />}
              value={draft.individualDetails.panNumber}
              onChange={(e) => {
                clearError('panNumber');
                onUpdateIndividual({ panNumber: e.target.value.toUpperCase() });
              }}
              error={errors.panNumber}
            />

            <WizardPillInput
              label="Residential Address"
              placeholder="Residential Address"
              icon={<MapPin className="w-[18px] h-[18px]" />}
              value={draft.individualDetails.residentialAddress}
              onChange={(e) => {
                clearError('residentialAddress');
                onUpdateIndividual({ residentialAddress: e.target.value });
              }}
              error={errors.residentialAddress}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <WizardPillSelect
                label="State"
                placeholder="State"
                value={draft.individualDetails.state}
                options={stateOptions}
                onChange={(nextState) => {
                  clearError('state');
                  clearError('city');
                  onUpdateIndividual({ state: nextState, city: '' });
                }}
                error={errors.state}
              />

              {cityOptions.length > 0 ? (
                <WizardPillSelect
                  label="City / District"
                  placeholder="City / District"
                  value={draft.individualDetails.city}
                  options={cityOptions}
                  onChange={(nextCity) => {
                    clearError('city');
                    onUpdateIndividual({ city: nextCity });
                  }}
                  error={errors.city}
                />
              ) : (
                <WizardPillInput
                  label="City / District"
                  placeholder="City / District"
                  icon={<MapPin className="w-4 h-4" />}
                  value={draft.individualDetails.city}
                  onChange={(e) => {
                    clearError('city');
                    onUpdateIndividual({ city: e.target.value });
                  }}
                  error={errors.city}
                />
              )}
            </div>

            <WizardPillInput
              label="PIN Code"
              placeholder="PIN Code"
              inputMode="numeric"
              maxLength={6}
              icon={<MapPin className="w-[18px] h-[18px]" />}
              value={draft.individualDetails.pinCode}
              onChange={(e) => {
                clearError('pinCode');
                onUpdateIndividual({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) });
              }}
              error={errors.pinCode}
            />

            <div className="pt-1">
              <DocumentUploadDropzone
                title="Upload Profile Photo (Optional)"
                formatsLabel="JPG, PNG (Max 5 MB)"
                accept="image/jpeg,image/png"
                document={draft.documents.profilePhoto}
                progress={uploadProgress.profilePhoto}
                error={uploadErrors.profilePhoto}
                onFileSelected={(file) => onUploadDocument('profilePhoto', file)}
                onRemove={() => onRemoveDocument('profilePhoto')}
              />
            </div>
          </>
        ) : (
          <>
            <WizardPillInput
              label="Legal Business Name"
              placeholder="Legal Business Name"
              icon={<Building2 className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.legalBusinessName}
              onChange={(e) => {
                clearError('legalBusinessName');
                onUpdateCompany({ legalBusinessName: e.target.value });
              }}
              error={errors.legalBusinessName}
            />

            <WizardPillInput
              label="Trade Name (Optional)"
              placeholder="Trade Name (Optional)"
              icon={<Briefcase className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.tradeName}
              onChange={(e) => onUpdateCompany({ tradeName: e.target.value })}
            />

            <WizardPillSelect
              label="Business Constitution"
              placeholder="Business Constitution"
              icon={<FileBadge2 className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.constitution}
              options={CONSTITUTION_OPTIONS}
              onChange={(value) => {
                clearError('constitution');
                onUpdateCompany({ constitution: value as BusinessConstitution });
              }}
              error={errors.constitution}
            />

            <WizardPillInput
              label="Company PAN"
              placeholder="Company PAN (e.g., AABCO1234K)"
              maxLength={10}
              icon={<CreditCard className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.companyPan}
              onChange={(e) => {
                clearError('companyPan');
                onUpdateCompany({ companyPan: e.target.value.toUpperCase() });
              }}
              error={errors.companyPan}
            />

            <WizardPillInput
              label="GSTIN (Optional)"
              placeholder="GSTIN (Where applicable)"
              maxLength={15}
              icon={<FileBadge2 className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.gstin}
              onChange={(e) => {
                clearError('gstin');
                onUpdateCompany({ gstin: e.target.value.toUpperCase() });
              }}
              error={errors.gstin}
            />

            <WizardPillInput
              label="Registered Address"
              placeholder="Registered Business Address"
              icon={<MapPin className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.registeredAddress}
              onChange={(e) => {
                clearError('registeredAddress');
                onUpdateCompany({ registeredAddress: e.target.value });
              }}
              error={errors.registeredAddress}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <WizardPillSelect
                label="State"
                placeholder="State"
                value={draft.companyDetails.state}
                options={stateOptions}
                onChange={(nextState) => {
                  clearError('state');
                  clearError('city');
                  onUpdateCompany({ state: nextState, city: '' });
                }}
                error={errors.state}
              />

              {cityOptions.length > 0 ? (
                <WizardPillSelect
                  label="City / District"
                  placeholder="City / District"
                  value={draft.companyDetails.city}
                  options={cityOptions}
                  onChange={(nextCity) => {
                    clearError('city');
                    onUpdateCompany({ city: nextCity });
                  }}
                  error={errors.city}
                />
              ) : (
                <WizardPillInput
                  label="City / District"
                  placeholder="City / District"
                  icon={<MapPin className="w-4 h-4" />}
                  value={draft.companyDetails.city}
                  onChange={(e) => {
                    clearError('city');
                    onUpdateCompany({ city: e.target.value });
                  }}
                  error={errors.city}
                />
              )}
            </div>

            <WizardPillInput
              label="PIN Code"
              placeholder="PIN Code"
              inputMode="numeric"
              maxLength={6}
              icon={<MapPin className="w-[18px] h-[18px]" />}
              value={draft.companyDetails.pinCode}
              onChange={(e) => {
                clearError('pinCode');
                onUpdateCompany({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) });
              }}
              error={errors.pinCode}
            />

            <div className="pt-2">
              <p className="text-[12.5px] font-bold text-[#18364B] ps-2 mb-2">
                Authorised Representative Details
              </p>
              <div className="space-y-2.5">
                <WizardPillInput
                  label="Authorised Representative Full Name"
                  placeholder="Authorised Representative Full Name"
                  icon={<User className="w-[18px] h-[18px]" />}
                  value={draft.companyDetails.representativeName}
                  onChange={(e) => {
                    clearError('representativeName');
                    onUpdateCompany({ representativeName: e.target.value });
                  }}
                  error={errors.representativeName}
                />

                <WizardPillInput
                  label="Representative Designation"
                  placeholder="Representative Designation (e.g., Director)"
                  icon={<Briefcase className="w-[18px] h-[18px]" />}
                  value={draft.companyDetails.representativeDesignation}
                  onChange={(e) => {
                    clearError('representativeDesignation');
                    onUpdateCompany({ representativeDesignation: e.target.value });
                  }}
                  error={errors.representativeDesignation}
                />

                <WizardPillInput
                  label="Representative Mobile Number"
                  placeholder="Representative Mobile Number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={14}
                  icon={<Phone className="w-[18px] h-[18px]" />}
                  value={draft.companyDetails.representativeMobile}
                  onChange={(e) => {
                    clearError('representativeMobile');
                    onUpdateCompany({ representativeMobile: e.target.value });
                  }}
                  error={errors.representativeMobile}
                />

                <WizardPillInput
                  label="Representative Email"
                  placeholder="Representative Email"
                  type="email"
                  icon={<Mail className="w-[18px] h-[18px]" />}
                  value={draft.companyDetails.representativeEmail}
                  onChange={(e) => {
                    clearError('representativeEmail');
                    onUpdateCompany({ representativeEmail: e.target.value });
                  }}
                  error={errors.representativeEmail}
                />

                {companyRequiresAuthorisation(draft.companyDetails.constitution) ? (
                  <DocumentUploadDropzone
                    title="Authorisation Document (Board Resolution / Letter)"
                    formatsLabel="JPG, PNG, PDF (Max 5 MB)"
                    accept="image/jpeg,image/png,application/pdf"
                    document={draft.documents.authorisationDoc}
                    progress={uploadProgress.authorisationDoc}
                    error={uploadErrors.authorisationDoc}
                    onFileSelected={(file) => onUploadDocument('authorisationDoc', file)}
                    onRemove={() => onRemoveDocument('authorisationDoc')}
                  />
                ) : null}
              </div>
            </div>
          </>
        )}
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
