import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearLocalShipperDraft,
  deleteRegistrationDocument,
  fetchShipperServerDraft,
  loadLocalShipperDraft,
  requestRegistrationOtp,
  saveLocalShipperDraft,
  saveLocalShipperSubmittedSummary,
  submitShipperApplication,
  syncShipperDraftToServer,
  uploadRegistrationDocument,
} from '../../services/registration/shipperRegistrationService';
import type {
  ShipperDocumentSlotKey,
  ShipperRegistrationDraft,
  ShipperVehicleType,
  SubmittedShipperApplicationSummary,
} from './shipperTypes';

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

export function createInitialShipperDraft(): ShipperRegistrationDraft {
  return {
    draftId: createRandomId('shpdraft'),
    currentStep: 1,
    account: {
      fullName: '',
      mobileNumber: '',
      email: '',
      termsAccepted: false,
    },
    businessType: null,
    individualDetails: {
      businessShopName: '',
      ownerFullName: '',
      businessCategory: 'Wholesale & Trading',
      panNumber: '',
      gstin: '',
      businessAddress: '',
      state: '',
      city: '',
      pinCode: '',
    },
    companyDetails: {
      legalCompanyName: '',
      tradeName: '',
      constitution: 'Private Limited',
      companyPan: '',
      gstin: '',
      businessCategory: 'Manufacturing',
      businessWebsite: '',
      registeredAddress: '',
      state: '',
      city: '',
      pinCode: '',
      representativeName: '',
      representativeDesignation: '',
      representativeMobile: '',
      representativeEmail: '',
    },
    shippingProfile: {
      mainGoodsCategory: 'General Goods',
      typicalCargo: [],
      averageWeightValue: '',
      averageWeightUnit: 'Tonnes',
      preferredVehicleTypes: [],
      primaryPickupLocation: '',
      regularDeliveryLocations: [],
      shipmentFrequency: 'Weekly',
    },
    documents: {},
    identityProofType: 'Voter ID',
    addressProofType: 'Utility Bill',
    declarationConfirmed: false,
    updatedAt: new Date().toISOString(),
  };
}

export function useShipperRegistration() {
  const [draft, setDraft] = useState<ShipperRegistrationDraft>(() => {
    const local = loadLocalShipperDraft();
    return local && local.draftId ? local : createInitialShipperDraft();
  });

  // Ephemeral security fields kept strictly in memory (never written to storage/server drafts)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatusMessage, setOtpStatusMessage] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<
    Partial<Record<ShipperDocumentSlotKey, number>>
  >({});
  const [uploadErrors, setUploadErrors] = useState<
    Partial<Record<ShipperDocumentSlotKey, string>>
  >({});

  const [submittedApplication, setSubmittedApplication] =
    useState<SubmittedShipperApplicationSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const local = loadLocalShipperDraft();
    if (!local?.draftId) return;
    void fetchShipperServerDraft(local.draftId).then((serverDraft) => {
      if (!active || !serverDraft) return;
      if (
        serverDraft.updatedAt &&
        (!local.updatedAt || serverDraft.updatedAt > local.updatedAt)
      ) {
        setDraft(serverDraft);
        saveLocalShipperDraft(serverDraft);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const updateDraft = useCallback(
    (updater: (prev: ShipperRegistrationDraft) => ShipperRegistrationDraft) => {
      setDraft((prev) => {
        const next: ShipperRegistrationDraft = {
          ...updater(prev),
          updatedAt: new Date().toISOString(),
        };
        saveLocalShipperDraft(next);
        if (syncTimerRef.current) {
          window.clearTimeout(syncTimerRef.current);
        }
        syncTimerRef.current = window.setTimeout(() => {
          void syncShipperDraftToServer(next);
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
      if (response.ok && response.configured) {
        setOtpStatusMessage(response.message);
      } else {
        setOtpStatusMessage(
          'SMS OTP service is not configured yet in this environment. You may continue completing your shipper registration details; OTP verification will activate once Firebase Authentication is connected.',
        );
      }
    } finally {
      setIsRequestingOtp(false);
    }
  }, [draft.account.mobileNumber, isRequestingOtp]);

  const toggleVehicleType = useCallback(
    (vehicleType: ShipperVehicleType) => {
      updateDraft((prev) => {
        const exists = prev.shippingProfile.preferredVehicleTypes.includes(vehicleType);
        const nextTypes = exists
          ? prev.shippingProfile.preferredVehicleTypes.filter((item) => item !== vehicleType)
          : [...prev.shippingProfile.preferredVehicleTypes, vehicleType];
        return {
          ...prev,
          shippingProfile: {
            ...prev.shippingProfile,
            preferredVehicleTypes: nextTypes,
          },
        };
      });
    },
    [updateDraft],
  );

  const toggleCargoTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      updateDraft((prev) => {
        const exists = prev.shippingProfile.typicalCargo.includes(trimmed);
        const nextTags = exists
          ? prev.shippingProfile.typicalCargo.filter((item) => item !== trimmed)
          : [...prev.shippingProfile.typicalCargo, trimmed];
        return {
          ...prev,
          shippingProfile: {
            ...prev.shippingProfile,
            typicalCargo: nextTags,
          },
        };
      });
    },
    [updateDraft],
  );

  const addDeliveryLocation = useCallback(
    (location: string) => {
      const cleaned = location.trim();
      if (cleaned.length < 2) return;
      updateDraft((prev) => {
        const duplicate = prev.shippingProfile.regularDeliveryLocations.some(
          (item) => item.toLowerCase() === cleaned.toLowerCase(),
        );
        if (duplicate) return prev;
        return {
          ...prev,
          shippingProfile: {
            ...prev.shippingProfile,
            regularDeliveryLocations: [
              ...prev.shippingProfile.regularDeliveryLocations,
              cleaned,
            ],
          },
        };
      });
    },
    [updateDraft],
  );

  const removeDeliveryLocation = useCallback(
    (location: string) => {
      updateDraft((prev) => ({
        ...prev,
        shippingProfile: {
          ...prev.shippingProfile,
          regularDeliveryLocations: prev.shippingProfile.regularDeliveryLocations.filter(
            (item) => item !== location,
          ),
        },
      }));
    },
    [updateDraft],
  );

  const uploadSlotDocument = useCallback(
    async (
      slotKey: ShipperDocumentSlotKey,
      file: File,
      proofSubType?: string,
    ): Promise<boolean> => {
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

      updateDraft((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [slotKey]: res.document,
        },
      }));
      setUploadProgress((prev) => ({ ...prev, [slotKey]: undefined }));

      return true;
    },
    [draft.documents, draft.draftId, updateDraft],
  );

  const removeSlotDocument = useCallback(
    async (slotKey: ShipperDocumentSlotKey) => {
      const existing = draft.documents[slotKey];
      updateDraft((prev) => {
        const nextDocs = { ...prev.documents };
        delete nextDocs[slotKey];
        return {
          ...prev,
          documents: nextDocs,
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
      await syncShipperDraftToServer(draft);
      const res = await submitShipperApplication(draft);
      if (!res.ok) {
        setSubmitError(res.message);
        return null;
      }
      saveLocalShipperSubmittedSummary(res.application);
      setSubmittedApplication(res.application);
      clearLocalShipperDraft();
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      return res.application;
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, isSubmitting]);

  const startNewRegistration = useCallback(() => {
    clearLocalShipperDraft();
    setSubmittedApplication(null);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setSubmitError(null);
    setDraft(createInitialShipperDraft());
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
    toggleVehicleType,
    toggleCargoTag,
    addDeliveryLocation,
    removeDeliveryLocation,
    uploadProgress,
    uploadErrors,
    uploadSlotDocument,
    removeSlotDocument,
    submittedApplication,
    isSubmitting,
    submitError,
    submitApplication,
    startNewRegistration,
  };
}
