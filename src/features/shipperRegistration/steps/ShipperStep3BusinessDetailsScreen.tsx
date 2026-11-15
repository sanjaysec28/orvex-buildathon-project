import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CreditCard,
  FileBadge2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  WizardPillInput,
  WizardPillSelect,
} from '../../registration/components/RegistrationInputs';
import { INDIAN_STATES_CITIES, getCitiesForState } from '../../registration/indianLocations';
import type { BusinessConstitution } from '../../registration/registrationTypes';
import { validateShipperBusinessDetails } from '../shipperValidation';
import type {
  BusinessCategoryOption,
  IndividualSellerDetailsData,
  RegisteredCompanyShipperDetailsData,
  ShipperRegistrationDraft,
} from '../shipperTypes';

export interface ShipperStep3BusinessDetailsScreenProps {
  draft: ShipperRegistrationDraft;
  onUpdateIndividual: (patch: Partial<IndividualSellerDetailsData>) => void;
  onUpdateCompany: (patch: Partial<RegisteredCompanyShipperDetailsData>) => void;
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

const BUSINESS_CATEGORY_OPTIONS: ReadonlyArray<{
  value: BusinessCategoryOption;
  label: string;
}> = [
  { value: 'Retail Store', label: 'Retail Store' },
  { value: 'Wholesale & Trading', label: 'Wholesale & Trading' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Distribution & Warehousing', label: 'Distribution & Warehousing' },
  { value: 'Agriculture & Produce', label: 'Agriculture & Produce' },
  { value: 'Textiles & Apparel', label: 'Textiles & Apparel' },
  { value: 'FMCG & Consumer Goods', label: 'FMCG & Consumer Goods' },
  { value: 'E-commerce & D2C', label: 'E-commerce & D2C' },
  { value: 'Industrial Equipment', label: 'Industrial Equipment' },
  { value: 'Other', label: 'Other' },
];

export function ShipperStep3BusinessDetailsScreen({
  draft,
  onUpdateIndividual,
  onUpdateCompany,
  onBack,
  onContinue,
}: ShipperStep3BusinessDetailsScreenProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCompany = draft.businessType === 'company';
  const activeState = isCompany ? draft.companyDetails.state : draft.individualDetails.state;
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
    const validationErrors = validateShipperBusinessDetails(draft);
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
        {!isCompany ? (
          <>
            <WizardPillInput
              compact
              label="Business / Shop Name"
              placeholder="Business / Shop Name"
              icon={<Store className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.businessShopName}
              onChange={(e) => {
                clearError('businessShopName');
                onUpdateIndividual({ businessShopName: e.target.value });
              }}
              error={errors.businessShopName}
            />

            <WizardPillInput
              compact
              label="Owner's Full Name"
              placeholder="Owner's Full Name"
              icon={<User className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.ownerFullName}
              onChange={(e) => {
                clearError('ownerFullName');
                onUpdateIndividual({ ownerFullName: e.target.value });
              }}
              error={errors.ownerFullName}
            />

            <WizardPillSelect
              compact
              label="Business Category"
              placeholder="Business Category"
              icon={<Briefcase className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.businessCategory}
              options={BUSINESS_CATEGORY_OPTIONS}
              onChange={(value) => {
                clearError('businessCategory');
                onUpdateIndividual({ businessCategory: value as BusinessCategoryOption });
              }}
              error={errors.businessCategory}
            />

            <WizardPillInput
              compact
              label="PAN Number (Optional)"
              placeholder="PAN Number (Optional)"
              maxLength={10}
              icon={<CreditCard className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.panNumber}
              onChange={(e) => {
                clearError('panNumber');
                onUpdateIndividual({ panNumber: e.target.value.toUpperCase() });
              }}
              error={errors.panNumber}
            />

            <WizardPillInput
              compact
              label="GSTIN (If Registered)"
              placeholder="GSTIN (If Registered)"
              maxLength={15}
              icon={<FileBadge2 className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.gstin}
              onChange={(e) => {
                clearError('gstin');
                onUpdateIndividual({ gstin: e.target.value.toUpperCase() });
              }}
              error={errors.gstin}
            />

            <WizardPillInput
              compact
              label="Business Address"
              placeholder="Business Address"
              icon={<MapPin className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.businessAddress}
              onChange={(e) => {
                clearError('businessAddress');
                onUpdateIndividual({ businessAddress: e.target.value });
              }}
              error={errors.businessAddress}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <WizardPillSelect
                compact
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
                  compact
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
                  compact
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
              compact
              label="PIN Code"
              placeholder="PIN Code"
              inputMode="numeric"
              maxLength={6}
              icon={<MapPin className="w-[17px] h-[17px]" />}
              value={draft.individualDetails.pinCode}
              onChange={(e) => {
                clearError('pinCode');
                onUpdateIndividual({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) });
              }}
              error={errors.pinCode}
            />
          </>
        ) : (
          <>
            <WizardPillInput
              compact
              label="Legal Company Name"
              placeholder="Legal Company Name"
              icon={<Building2 className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.legalCompanyName}
              onChange={(e) => {
                clearError('legalCompanyName');
                onUpdateCompany({ legalCompanyName: e.target.value });
              }}
              error={errors.legalCompanyName}
            />

            <WizardPillInput
              compact
              label="Trade Name (Optional)"
              placeholder="Trade Name (Optional)"
              icon={<Store className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.tradeName}
              onChange={(e) => onUpdateCompany({ tradeName: e.target.value })}
            />

            <WizardPillSelect
              compact
              label="Business Constitution"
              placeholder="Business Constitution"
              icon={<FileBadge2 className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.constitution}
              options={CONSTITUTION_OPTIONS}
              onChange={(value) => {
                clearError('constitution');
                onUpdateCompany({ constitution: value as BusinessConstitution });
              }}
              error={errors.constitution}
            />

            <WizardPillInput
              compact
              label="Company PAN"
              placeholder="Company PAN (e.g., AABCO1234K)"
              maxLength={10}
              icon={<CreditCard className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.companyPan}
              onChange={(e) => {
                clearError('companyPan');
                onUpdateCompany({ companyPan: e.target.value.toUpperCase() });
              }}
              error={errors.companyPan}
            />

            <WizardPillInput
              compact
              label="GSTIN (If Registered)"
              placeholder="GSTIN (If Registered)"
              maxLength={15}
              icon={<FileBadge2 className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.gstin}
              onChange={(e) => {
                clearError('gstin');
                onUpdateCompany({ gstin: e.target.value.toUpperCase() });
              }}
              error={errors.gstin}
            />

            <WizardPillSelect
              compact
              label="Business Category"
              placeholder="Business Category"
              icon={<Briefcase className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.businessCategory}
              options={BUSINESS_CATEGORY_OPTIONS}
              onChange={(value) => {
                clearError('businessCategory');
                onUpdateCompany({ businessCategory: value as BusinessCategoryOption });
              }}
              error={errors.businessCategory}
            />

            <WizardPillInput
              compact
              label="Business Website (Optional)"
              placeholder="Business Website (Optional)"
              type="url"
              icon={<Globe className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.businessWebsite}
              onChange={(e) => {
                clearError('businessWebsite');
                onUpdateCompany({ businessWebsite: e.target.value });
              }}
              error={errors.businessWebsite}
            />

            <WizardPillInput
              compact
              label="Registered Business Address"
              placeholder="Registered Business Address"
              icon={<MapPin className="w-[17px] h-[17px]" />}
              value={draft.companyDetails.registeredAddress}
              onChange={(e) => {
                clearError('registeredAddress');
                onUpdateCompany({ registeredAddress: e.target.value });
              }}
              error={errors.registeredAddress}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <WizardPillSelect
                compact
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
                  compact
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
                  compact
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
              compact
              label="PIN Code"
              placeholder="PIN Code"
              inputMode="numeric"
              maxLength={6}
              icon={<MapPin className="w-[17px] h-[17px]" />}
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
                  compact
                  label="Authorised Representative Name"
                  placeholder="Authorised Representative Name"
                  icon={<User className="w-[17px] h-[17px]" />}
                  value={draft.companyDetails.representativeName}
                  onChange={(e) => {
                    clearError('representativeName');
                    onUpdateCompany({ representativeName: e.target.value });
                  }}
                  error={errors.representativeName}
                />

                <WizardPillInput
                  compact
                  label="Designation"
                  placeholder="Designation (e.g., Supply Chain Head)"
                  icon={<Briefcase className="w-[17px] h-[17px]" />}
                  value={draft.companyDetails.representativeDesignation}
                  onChange={(e) => {
                    clearError('representativeDesignation');
                    onUpdateCompany({ representativeDesignation: e.target.value });
                  }}
                  error={errors.representativeDesignation}
                />

                <WizardPillInput
                  compact
                  label="Representative Mobile"
                  placeholder="Representative Mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={14}
                  icon={<Phone className="w-[17px] h-[17px]" />}
                  value={draft.companyDetails.representativeMobile}
                  onChange={(e) => {
                    clearError('representativeMobile');
                    onUpdateCompany({ representativeMobile: e.target.value });
                  }}
                  error={errors.representativeMobile}
                />

                <WizardPillInput
                  compact
                  label="Representative Email"
                  placeholder="Representative Email"
                  type="email"
                  icon={<Mail className="w-[17px] h-[17px]" />}
                  value={draft.companyDetails.representativeEmail}
                  onChange={(e) => {
                    clearError('representativeEmail');
                    onUpdateCompany({ representativeEmail: e.target.value });
                  }}
                  error={errors.representativeEmail}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2.5 pt-2">
        <button
          type="submit"
          className="w-full h-[52px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] text-[#18364B] font-bold text-[15.5px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full h-[48px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>
      </div>
    </form>
  );
}
