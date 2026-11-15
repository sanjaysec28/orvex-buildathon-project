import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CarFront,
  CreditCard,
  Crown,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '../../../utils/cn';
import {
  DocumentUploadDropzone,
  WizardPillInput,
  WizardPillSelect,
} from '../components/RegistrationInputs';
import { validateDriversStep } from '../registrationValidation';
import type {
  DocumentSlotKey,
  DriverRecord,
  LicenceClassType,
  UploadedDocumentMeta,
} from '../registrationTypes';

export interface Step4DriverInfoScreenProps {
  drivers: DriverRecord[];
  primaryLicenceDocument?: UploadedDocumentMeta | null;
  uploadProgress: Partial<Record<DocumentSlotKey, number>>;
  uploadErrors: Partial<Record<DocumentSlotKey, string>>;
  onUpdateDriver: (driverId: string, patch: Partial<DriverRecord>) => void;
  onAddDriver: () => void;
  onRemoveDriver: (driverId: string) => void;
  onUploadPrimaryLicence: (file: File) => void;
  onRemovePrimaryLicence: () => void;
  onBack: () => void;
  onContinue: () => void;
}

const LICENCE_CLASSES: ReadonlyArray<{ value: LicenceClassType; label: string }> = [
  { value: 'LMV', label: 'LMV (Light Motor Vehicle)' },
  { value: 'LMV-TR', label: 'LMV-TR (Light Transport)' },
  { value: 'MGV', label: 'MGV (Medium Goods Vehicle)' },
  { value: 'HMV', label: 'HMV (Heavy Motor Vehicle)' },
  { value: 'HGV', label: 'HGV (Heavy Goods Vehicle)' },
  { value: 'Trans (Transport Vehicle)', label: 'Trans (Transport Vehicle)' },
];

export function Step4DriverInfoScreen({
  drivers,
  primaryLicenceDocument,
  uploadProgress,
  uploadErrors,
  onUpdateDriver,
  onAddDriver,
  onRemoveDriver,
  onUploadPrimaryLicence,
  onRemovePrimaryLicence,
  onBack,
  onContinue,
}: Step4DriverInfoScreenProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) => {
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
    const validationErrors = validateDriversStep(drivers);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-3.5">
        {drivers.map((driver, index) => {
          const prefix = `driver_${index}_`;
          const isPrimary = driver.isPrimary;

          return (
            <section
              key={driver.id}
              aria-label={isPrimary ? 'Primary Driver' : `Additional Driver ${index + 1}`}
              className={cn(
                'rounded-[20px] p-3.5 space-y-2.5 shadow-[0_3px_12px_-3px_rgba(24,54,75,0.06)]',
                isPrimary
                  ? 'bg-[#FFF9DC] border border-[#F3E19A]'
                  : 'bg-white border border-[#DCEAF4]',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                {isPrimary ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE99D] text-[#18364B] text-[12px] font-bold">
                    <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Primary Driver</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5F3FA] text-[#18364B] text-[12px] font-bold">
                    Driver #{index + 1}
                  </span>
                )}

                {!isPrimary ? (
                  <button
                    type="button"
                    onClick={() => onRemoveDriver(driver.id)}
                    aria-label={`Remove Driver #${index + 1}`}
                    className="min-h-[32px] px-2.5 rounded-full inline-flex items-center gap-1 text-[12px] font-semibold text-[#C62828] hover:bg-[#FEF3F2] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Remove</span>
                  </button>
                ) : null}
              </div>

              <WizardPillInput
                compact
                label="Driver Full Name"
                placeholder="Driver Full Name"
                icon={<User className="w-[17px] h-[17px]" />}
                value={driver.fullName}
                onChange={(e) => {
                  clearFieldError(`${prefix}fullName`);
                  onUpdateDriver(driver.id, { fullName: e.target.value });
                }}
                error={errors[`${prefix}fullName`]}
              />

              <WizardPillInput
                compact
                label="Mobile Number"
                placeholder="Mobile Number"
                type="tel"
                inputMode="numeric"
                maxLength={14}
                icon={<Phone className="w-[17px] h-[17px]" />}
                value={driver.mobileNumber}
                onChange={(e) => {
                  clearFieldError(`${prefix}mobileNumber`);
                  onUpdateDriver(driver.id, { mobileNumber: e.target.value });
                }}
                error={errors[`${prefix}mobileNumber`]}
              />

              <WizardPillInput
                compact
                label="Driving Licence Number"
                placeholder="Driving Licence Number"
                icon={<CreditCard className="w-[17px] h-[17px]" />}
                value={driver.licenceNumber}
                onChange={(e) => {
                  clearFieldError(`${prefix}licenceNumber`);
                  onUpdateDriver(driver.id, { licenceNumber: e.target.value.toUpperCase() });
                }}
                error={errors[`${prefix}licenceNumber`]}
              />

              <div>
                <label
                  htmlFor={`${driver.id}-expiry`}
                  className="block text-[11.5px] font-semibold text-[#3F5B6E] ps-3 mb-1"
                >
                  Licence Expiry Date
                </label>
                <WizardPillInput
                  id={`${driver.id}-expiry`}
                  compact
                  label="Licence Expiry Date"
                  type="date"
                  icon={<Calendar className="w-[17px] h-[17px]" />}
                  value={driver.licenceExpiryDate}
                  onChange={(e) => {
                    clearFieldError(`${prefix}licenceExpiryDate`);
                    onUpdateDriver(driver.id, { licenceExpiryDate: e.target.value });
                  }}
                  error={errors[`${prefix}licenceExpiryDate`]}
                />
              </div>

              <WizardPillSelect
                compact
                label="Licence Class / Vehicle Category"
                placeholder="Licence Class / Vehicle Category"
                icon={<CarFront className="w-[17px] h-[17px]" />}
                value={driver.licenceClass}
                options={LICENCE_CLASSES}
                onChange={(val) => {
                  clearFieldError(`${prefix}licenceClass`);
                  onUpdateDriver(driver.id, { licenceClass: val as LicenceClassType });
                }}
                error={errors[`${prefix}licenceClass`]}
              />

              <WizardPillInput
                compact
                label="Driver Address"
                placeholder="Driver Address"
                icon={<MapPin className="w-[17px] h-[17px]" />}
                value={driver.address}
                onChange={(e) => {
                  clearFieldError(`${prefix}address`);
                  onUpdateDriver(driver.id, { address: e.target.value });
                }}
                error={errors[`${prefix}address`]}
              />

              {isPrimary ? (
                <div className="pt-0.5">
                  <DocumentUploadDropzone
                    title="Upload Driving Licence"
                    formatsLabel="JPG, PNG, PDF (Max 5 MB)"
                    accept="image/jpeg,image/png,application/pdf"
                    document={primaryLicenceDocument ?? driver.licenceDocument}
                    progress={uploadProgress.driverLicence}
                    error={uploadErrors.driverLicence}
                    onFileSelected={onUploadPrimaryLicence}
                    onRemove={onRemovePrimaryLicence}
                  />
                </div>
              ) : null}
            </section>
          );
        })}

        <button
          type="button"
          onClick={onAddDriver}
          className="w-full h-[46px] rounded-full bg-[#DCEFFC] hover:bg-[#CBE6F9] text-[#18364B] font-bold text-[14px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Add Another Driver</span>
        </button>
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
