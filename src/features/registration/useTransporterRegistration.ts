import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearLocalDraft,
  deleteRegistrationDocument,
  fetchServerDraft,
  loadLocalDraft,
  requestRegistrationOtp,
  saveLocalDraft,
  saveLocalSubmittedSummary,
  submitTransporterApplication,
  syncDraftToServer,
  uploadRegistrationDocument,
} from '../../services/registration/transporterRegistrationService';
import type {
  DocumentSlotKey,
  DriverRecord,
  SubmittedTransporterApplicationSummary,
  TransporterRegistrationDraft,
} from './registrationTypes';

function createRandomId(prefix: string): string {
  const bytes = new Uint8Array(6);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

function createEmptyDriver(isPrimary: boolean): DriverRecord {
  return {
    id: createRandomId('drv'),
    isPrimary,
    fullName: '',
    mobileNumber: '',
    licenceNumber: '',
    licenceExpiryDate: '',
    licenceClass: 'HMV',
    address: '',
    licenceDocument: null,
  };
}

function createInitialDraft(): TransporterRegistrationDraft {
  return {
    draftId: createRandomId('draft'),
    currentStep: 1,
    account: {
      fullName: '',
      mobileNumber: '',
      email: '',
      termsAccepted: false,
    },
    transporterType: 'individual',
    individualDetails: {
      legalFullName: '',
      dateOfBirth: '',
      panNumber: '',
      residentialAddress: '',
      state: '',
      city: '',
      pinCode: '',
    },
    companyDetails: {
      legalBusinessName: '',
      tradeName: '',
      constitution: 'Private Limited',
      companyPan: '',
      gstin: '',
      registeredAddress: '',
      state: '',
      city: '',
      pinCode: '',
      representativeName: '',
      representativeDesignation: '',
      representativeMobile: '',
      representativeEmail: '',
    },
    drivers: [createEmptyDriver(true)],
    documents: {},
    identityProofType: 'Voter ID',
    addressProofType: 'Utility Bill',
    declarationConfirmed: false,
    updatedAt: new Date().toISOString(),
  };
}

export function useTransporterRegistration() {
  const [draft, setDraft] = useState<TransporterRegistrationDraft>(() => {
    const local = loadLocalDraft();
    return local && local.draftId ? local : createInitialDraft();
  });

  // Ephemeral security fields kept strictly in memory (never written to storage/server drafts)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatusMessage, setOtpStatusMessage] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<Partial<Record<DocumentSlotKey, number>>>({});
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<DocumentSlotKey, string>>>({});

  const [submittedApplication, setSubmittedApplication] =
    useState<SubmittedTransporterApplicationSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const syncTimerRef = useRef<number | null>(null);

  // Hydrate server copy on mount if a saved draft exists
  useEffect(() => {
    let active = true;
    const local = loadLocalDraft();
    if (!local?.draftId) return;
    void fetchServerDraft(local.draftId).then((serverDraft) => {
      if (!active || !serverDraft) return;
      if (serverDraft.updatedAt && (!local.updatedAt || serverDraft.updatedAt > local.updatedAt)) {
        setDraft(serverDraft);
        saveLocalDraft(serverDraft);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const updateDraft = useCallback(
    (updater: (prev: TransporterRegistrationDraft) => TransporterRegistrationDraft) => {
      setDraft((prev) => {
        const next: TransporterRegistrationDraft = {
          ...updater(prev),
          updatedAt: new Date().toISOString(),
        };
        saveLocalDraft(next);
        if (syncTimerRef.current) {
          window.clearTimeout(syncTimerRef.current);
        }
        syncTimerRef.current = window.setTimeout(() => {
          void syncDraftToServer(next);
        }, 350);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const goToStep = useCallback(
    (step: 1 | 2 | 3 | 4 | 5 | 6) => {
      updateDraft((prev) => ({ ...prev, currentStep: step }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateDraft],
  );

  const handleRequestOtp = useCallback(async () => {
    if (isRequestingOtp) return;
    setIsRequestingOtp(true);
    setOtpStatusMessage(null);
    try {
      const response = await requestRegistrationOtp(draft.account.mobileNumber);
      setOtpStatusMessage(response.message);
    } finally {
      setIsRequestingOtp(false);
    }
  }, [draft.account.mobileNumber, isRequestingOtp]);

  const addAdditionalDriver = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      drivers: [...prev.drivers, createEmptyDriver(false)],
    }));
  }, [updateDraft]);

  const removeAdditionalDriver = useCallback(
    (driverId: string) => {
      updateDraft((prev) => ({
        ...prev,
        drivers: prev.drivers.filter((driver) => driver.isPrimary || driver.id !== driverId),
      }));
    },
    [updateDraft],
  );

  const updateDriver = useCallback(
    (driverId: string, patch: Partial<DriverRecord>) => {
      updateDraft((prev) => ({
        ...prev,
        drivers: prev.drivers.map((driver) =>
          driver.id === driverId ? { ...driver, ...patch } : driver,
        ),
      }));
    },
    [updateDraft],
  );

  const uploadSlotDocument = useCallback(
    async (slotKey: DocumentSlotKey, file: File, proofSubType?: string): Promise<boolean> => {
      setUploadErrors((prev) => ({ ...prev, [slotKey]: undefined }));
      setUploadProgress((prev) => ({ ...prev, [slotKey]: 8 }));

      const existingDoc = draft.documents[slotKey];

      const res = await uploadRegistrationDocument({
        draftId: draft.draftId,
        slotKey,
        file,
        proofSubType,
        onProgress: (pct) => {
          setUploadProgress((prev) => ({ ...prev, [slotKey]: pct }));
        },
      });

      if (!res.ok) {
        setUploadProgress((prev) => ({ ...prev, [slotKey]: undefined }));
        setUploadErrors((prev) => ({ ...prev, [slotKey]: res.message }));
        return false;
      }

      if (existingDoc?.documentId) {
        void deleteRegistrationDocument(existingDoc.documentId);
      }

      updateDraft((prev) => {
        const nextDocs = { ...prev.documents, [slotKey]: res.document };
        const nextDrivers =
          slotKey === 'driverLicence'
            ? prev.drivers.map((d) => (d.isPrimary ? { ...d, licenceDocument: res.document } : d))
            : prev.drivers;
        return {
          ...prev,
          documents: nextDocs,
          drivers: nextDrivers,
        };
      });

      window.setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [slotKey]: undefined }));
      }, 300);

      return true;
    },
    [draft.documents, draft.draftId, updateDraft],
  );

  const removeSlotDocument = useCallback(
    async (slotKey: DocumentSlotKey) => {
      const existing = draft.documents[slotKey];
      updateDraft((prev) => {
        const nextDocs = { ...prev.documents };
        delete nextDocs[slotKey];
        const nextDrivers =
          slotKey === 'driverLicence'
            ? prev.drivers.map((d) => (d.isPrimary ? { ...d, licenceDocument: null } : d))
            : prev.drivers;
        return {
          ...prev,
          documents: nextDocs,
          drivers: nextDrivers,
        };
      });
      if (existing?.documentId) {
        await deleteRegistrationDocument(existing.documentId);
      }
    },
    [draft.documents, updateDraft],
  );

  const submitApplication = useCallback(async () => {
    if (isSubmitting) return null;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await syncDraftToServer(draft);
      const res = await submitTransporterApplication(draft);
      if (!res.ok) {
        setSubmitError(res.message);
        return null;
      }
      saveLocalSubmittedSummary(res.application);
      setSubmittedApplication(res.application);
      clearLocalDraft();
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      return res.application;
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, isSubmitting]);

  const startNewRegistration = useCallback(() => {
    clearLocalDraft();
    setSubmittedApplication(null);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setSubmitError(null);
    setDraft(createInitialDraft());
  }, []);

  return {
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
    setSubmittedApplication,
    isSubmitting,
    submitError,
    setSubmitError,
    submitApplication,
    startNewRegistration,
  };
}
