import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../hooks/useRoleContext';
import {
  LegalPolicyModal,
  RegistrationShell,
  useLegalPolicyModal,
} from '../registration/components/RegistrationShell';
import { ShipperStep1AccountScreen } from './steps/ShipperStep1AccountScreen';
import { ShipperStep2BusinessTypeScreen } from './steps/ShipperStep2BusinessTypeScreen';
import { ShipperStep3BusinessDetailsScreen } from './steps/ShipperStep3BusinessDetailsScreen';
import { ShipperStep4ShippingProfileScreen } from './steps/ShipperStep4ShippingProfileScreen';
import { ShipperStep5DocumentVerificationScreen } from './steps/ShipperStep5DocumentVerificationScreen';
import { ShipperStep6ReviewApplicationScreen } from './steps/ShipperStep6ReviewApplicationScreen';
import { useShipperRegistration } from './useShipperRegistration';

function getShipperStepHeader(step: 1 | 2 | 3 | 4 | 5 | 6): {
  heading: string;
  subtitle: string;
} {
  switch (step) {
    case 1:
      return {
        heading: 'Create Your Account',
        subtitle: 'Start your journey as a Shipper.',
      };
    case 2:
      return {
        heading: 'Choose Business Type',
        subtitle: 'How do you operate your business?',
      };
    case 3:
      return {
        heading: 'Business Details',
        subtitle: 'Tell us about your business.',
      };
    case 4:
      return {
        heading: 'Shipping Profile',
        subtitle: 'Help us understand your shipping needs.',
      };
    case 5:
      return {
        heading: 'Document Verification',
        subtitle: 'Upload the required documents.',
      };
    case 6:
      return {
        heading: 'Review Your Application',
        subtitle: 'Check your details before submitting.',
      };
  }
}

export function ShipperRegistrationPage() {
  const navigate = useNavigate();
  const { role, setRole } = useRoleContext();
  const { policyTopic, setPolicyTopic } = useLegalPolicyModal();

  useEffect(() => {
    if (role !== 'shipper') {
      setRole('shipper');
    }
  }, [role, setRole]);

  const {
    draft,
    updateDraft,
    goToStep,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    otpStatusMessage,
    isRequestingOtp,
    handleRequestOtp,
    toggleVehicleType,
    toggleCargoTag,
    addDeliveryLocation,
    removeDeliveryLocation,
    uploadProgress,
    uploadErrors,
    uploadSlotDocument,
    removeSlotDocument,
    isSubmitting,
    submitError,
    submitApplication,
  } = useShipperRegistration();

  const currentStep = draft.currentStep;
  const { heading, subtitle } = getShipperStepHeader(currentStep);

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/auth?role=shipper');
      return;
    }
    goToStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleSubmitApplication = async () => {
    const submitted = await submitApplication();
    if (submitted) {
      navigate(
        `/shipper/application-submitted?applicationId=${encodeURIComponent(
          submitted.applicationId,
        )}`,
      );
    }
  };

  return (
    <>
      <RegistrationShell
        step={currentStep}
        heading={heading}
        subtitle={subtitle}
        onBack={handleBack}
        backAriaLabel={currentStep === 1 ? 'Back to Shipper Login' : 'Go to previous step'}
      >
        {currentStep === 1 ? (
          <ShipperStep1AccountScreen
            account={draft.account}
            password={password}
            confirmPassword={confirmPassword}
            otp={otp}
            otpStatusMessage={otpStatusMessage}
            isRequestingOtp={isRequestingOtp}
            onChangeAccount={(patch) =>
              updateDraft((prev) => ({
                ...prev,
                account: { ...prev.account, ...patch },
              }))
            }
            onChangePassword={setPassword}
            onChangeConfirmPassword={setConfirmPassword}
            onChangeOtp={setOtp}
            onRequestOtp={() => {
              void handleRequestOtp();
            }}
            onOpenLegal={setPolicyTopic}
            onContinue={() => goToStep(2)}
          />
        ) : null}

        {currentStep === 2 ? (
          <ShipperStep2BusinessTypeScreen
            selectedType={draft.businessType}
            onSelectType={(nextType) =>
              updateDraft((prev) => ({ ...prev, businessType: nextType }))
            }
            onContinue={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        ) : null}

        {currentStep === 3 ? (
          <ShipperStep3BusinessDetailsScreen
            draft={draft}
            onUpdateIndividual={(patch) =>
              updateDraft((prev) => ({
                ...prev,
                individualDetails: { ...prev.individualDetails, ...patch },
              }))
            }
            onUpdateCompany={(patch) =>
              updateDraft((prev) => ({
                ...prev,
                companyDetails: { ...prev.companyDetails, ...patch },
              }))
            }
            onBack={() => goToStep(2)}
            onContinue={() => goToStep(4)}
          />
        ) : null}

        {currentStep === 4 ? (
          <ShipperStep4ShippingProfileScreen
            draft={draft}
            onUpdateProfile={(patch) =>
              updateDraft((prev) => ({
                ...prev,
                shippingProfile: { ...prev.shippingProfile, ...patch },
              }))
            }
            onToggleCargoTag={toggleCargoTag}
            onToggleVehicleType={toggleVehicleType}
            onAddDeliveryLocation={addDeliveryLocation}
            onRemoveDeliveryLocation={removeDeliveryLocation}
            onBack={() => goToStep(3)}
            onContinue={() => goToStep(5)}
          />
        ) : null}

        {currentStep === 5 ? (
          <ShipperStep5DocumentVerificationScreen
            draft={draft}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
            onChangeIdentityProofType={(identityProofType) =>
              updateDraft((prev) => ({ ...prev, identityProofType }))
            }
            onChangeAddressProofType={(addressProofType) =>
              updateDraft((prev) => ({ ...prev, addressProofType }))
            }
            onUploadDocument={(slotKey, file, proofSubType) => {
              void uploadSlotDocument(slotKey, file, proofSubType);
            }}
            onRemoveDocument={(slotKey) => {
              void removeSlotDocument(slotKey);
            }}
            onBack={() => goToStep(4)}
            onContinue={() => goToStep(6)}
          />
        ) : null}

        {currentStep === 6 ? (
          <ShipperStep6ReviewApplicationScreen
            draft={draft}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onEditStep={(targetStep) => goToStep(targetStep)}
            onToggleDeclaration={(checked) =>
              updateDraft((prev) => ({ ...prev, declarationConfirmed: checked }))
            }
            onOpenLegal={setPolicyTopic}
            onBack={() => goToStep(5)}
            onSubmit={() => {
              void handleSubmitApplication();
            }}
          />
        ) : null}
      </RegistrationShell>

      <LegalPolicyModal topic={policyTopic} onClose={() => setPolicyTopic(null)} roleType="shipper" />
    </>
  );
}
