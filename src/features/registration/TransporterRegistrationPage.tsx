import { useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useRoleContext } from '../../hooks/useRoleContext';
import {
  LegalPolicyModal,
  RegistrationShell,
  useLegalPolicyModal,
} from './components/RegistrationShell';
import { Step1AccountScreen } from './steps/Step1AccountScreen';
import { Step2TransporterTypeScreen } from './steps/Step2TransporterTypeScreen';
import { Step3OwnerDetailsScreen } from './steps/Step3OwnerDetailsScreen';
import { Step4DriverInfoScreen } from './steps/Step4DriverInfoScreen';
import { Step5DocumentVerificationScreen } from './steps/Step5DocumentVerificationScreen';
import { Step6ReviewApplicationScreen } from './steps/Step6ReviewApplicationScreen';
import { Step7SubmittedScreen } from './steps/Step7SubmittedScreen';
import type { TransporterType } from './registrationTypes';
import { useTransporterRegistration } from './useTransporterRegistration';

function getStepHeader(
  step: 1 | 2 | 3 | 4 | 5 | 6,
  transporterType: TransporterType,
): { heading: string; subtitle: string } {
  switch (step) {
    case 1:
      return {
        heading: 'Create Your Account',
        subtitle: 'Start your journey with ORVEX',
      };
    case 2:
      return {
        heading: 'Choose Transporter Type',
        subtitle: 'Tell us how you operate',
      };
    case 3:
      return transporterType === 'individual'
        ? {
            heading: 'Owner Details',
            subtitle: 'Your personal information for verification',
          }
        : {
            heading: 'Business Details',
            subtitle: 'Your company details for verification',
          };
    case 4:
      return {
        heading: 'Driver Information',
        subtitle: 'Add at least one driver for your operations',
      };
    case 5:
      return {
        heading: 'Document Verification',
        subtitle: 'Upload the required documents for verification',
      };
    case 6:
      return {
        heading: 'Review Your Application',
        subtitle: 'Check your details before submitting',
      };
  }
}

export function TransporterRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, setRole } = useRoleContext();
  const { policyTopic, setPolicyTopic } = useLegalPolicyModal();

  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (roleParam === 'transporter' && role !== 'transporter') {
      setRole('transporter');
    }
  }, [role, roleParam, setRole]);

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
    addAdditionalDriver,
    removeAdditionalDriver,
    updateDriver,
    uploadProgress,
    uploadErrors,
    uploadSlotDocument,
    removeSlotDocument,
    submittedApplication,
    isSubmitting,
    submitError,
    submitApplication,
    startNewRegistration,
  } = useTransporterRegistration();

  // Preserve Shipper isolation if user explicitly arrives as Shipper
  if (roleParam === 'shipper') {
    return <Navigate to="/auth?role=shipper" replace />;
  }

  if (submittedApplication) {
    return (
      <RegistrationShell>
        <Step7SubmittedScreen
          application={submittedApplication}
          onViewApplication={() =>
            navigate(
              `/auth/register/status?applicationId=${encodeURIComponent(
                submittedApplication.applicationId,
              )}`,
            )
          }
          onBackToLogin={() => {
            startNewRegistration();
            navigate('/auth?role=transporter');
          }}
        />
      </RegistrationShell>
    );
  }

  const currentStep = draft.currentStep;
  const { heading, subtitle } = getStepHeader(currentStep, draft.transporterType);

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/auth?role=transporter');
      return;
    }
    goToStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
  };

  return (
    <>
      <RegistrationShell
        step={currentStep}
        heading={heading}
        subtitle={subtitle}
        onBack={handleBack}
        backAriaLabel={currentStep === 1 ? 'Back to Transporter Login' : 'Go to previous step'}
      >
        {currentStep === 1 ? (
          <Step1AccountScreen
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
          <Step2TransporterTypeScreen
            selectedType={draft.transporterType}
            onSelectType={(nextType) =>
              updateDraft((prev) => ({ ...prev, transporterType: nextType }))
            }
            onContinue={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        ) : null}

        {currentStep === 3 ? (
          <Step3OwnerDetailsScreen
            draft={draft}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
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
            onUploadDocument={(slotKey, file) => {
              void uploadSlotDocument(slotKey, file);
            }}
            onRemoveDocument={(slotKey) => {
              void removeSlotDocument(slotKey);
            }}
            onBack={() => goToStep(2)}
            onContinue={() => goToStep(4)}
          />
        ) : null}

        {currentStep === 4 ? (
          <Step4DriverInfoScreen
            drivers={draft.drivers}
            primaryLicenceDocument={draft.documents.driverLicence}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
            onUpdateDriver={updateDriver}
            onAddDriver={addAdditionalDriver}
            onRemoveDriver={removeAdditionalDriver}
            onUploadPrimaryLicence={(file) => {
              void uploadSlotDocument('driverLicence', file);
            }}
            onRemovePrimaryLicence={() => {
              void removeSlotDocument('driverLicence');
            }}
            onBack={() => goToStep(3)}
            onContinue={() => goToStep(5)}
          />
        ) : null}

        {currentStep === 5 ? (
          <Step5DocumentVerificationScreen
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
          <Step6ReviewApplicationScreen
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
              void submitApplication();
            }}
          />
        ) : null}
      </RegistrationShell>

      <LegalPolicyModal topic={policyTopic} onClose={() => setPolicyTopic(null)} />
    </>
  );
}
