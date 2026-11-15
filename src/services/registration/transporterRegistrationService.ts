import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../../features/registration/registrationValidation';
import type {
  DocumentSlotKey,
  SubmittedTransporterApplicationSummary,
  TransporterRegistrationDraft,
  UploadedDocumentMeta,
} from '../../features/registration/registrationTypes';

export const DRAFT_LOCAL_KEY = 'orvex.transporter.registration.draft';
export const SUBMITTED_LOCAL_KEY = 'orvex.transporter.registration.submitted';

export interface OtpRequestResponse {
  ok: boolean;
  configured: boolean;
  code?: string;
  message: string;
}

export async function requestRegistrationOtp(mobileNumber: string): Promise<OtpRequestResponse> {
  try {
    const response = await fetch('/api/registration/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });
    const payload = (await response.json()) as OtpRequestResponse;
    return payload;
  } catch {
    return {
      ok: false,
      configured: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach OTP service. Please check your connection.',
    };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read selected file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed reading selected file.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadRegistrationDocument(params: {
  draftId: string;
  slotKey: DocumentSlotKey;
  file: File;
  proofSubType?: string;
  onProgress?: (percent: number) => void;
}): Promise<{ ok: true; document: UploadedDocumentMeta } | { ok: false; message: string }> {
  const { draftId, slotKey, file, proofSubType, onProgress } = params;

  const allowedTypes =
    slotKey === 'profilePhoto' ? ALLOWED_IMAGE_MIME_TYPES : ALLOWED_DOCUMENT_MIME_TYPES;

  if (!allowedTypes.includes(file.type as never)) {
    return {
      ok: false,
      message:
        slotKey === 'profilePhoto'
          ? 'Please upload a JPG or PNG image.'
          : 'Please upload a JPG, PNG, or PDF file.',
    };
  }

  if (file.size === 0 || file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      ok: false,
      message: 'File size must be under 5 MB.',
    };
  }

  onProgress?.(10);
  let base64Data: string;
  try {
    base64Data = await readFileAsDataUrl(file);
  } catch {
    return { ok: false, message: 'Failed to read file from device.' };
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/registration/documents');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const pct = Math.min(95, Math.max(15, Math.round((event.loaded / event.total) * 90)));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          ok: boolean;
          document?: UploadedDocumentMeta;
          message?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.document) {
          onProgress?.(100);
          resolve({ ok: true, document: data.document });
          return;
        }
        resolve({
          ok: false,
          message: data.message ?? 'Upload failed. Please try again.',
        });
      } catch {
        resolve({ ok: false, message: 'Unexpected server response during upload.' });
      }
    };

    xhr.onerror = () => {
      resolve({ ok: false, message: 'Network error while uploading document.' });
    };

    xhr.send(
      JSON.stringify({
        draftId,
        slotKey,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        base64Data,
        proofSubType,
      }),
    );
  });
}

export async function deleteRegistrationDocument(documentId: string): Promise<void> {
  try {
    await fetch(`/api/registration/documents/${encodeURIComponent(documentId)}`, {
      method: 'DELETE',
    });
  } catch {
    // Ignore transient delete failures
  }
}

export function loadLocalDraft(): TransporterRegistrationDraft | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(DRAFT_LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TransporterRegistrationDraft;
  } catch {
    return null;
  }
}

export function saveLocalDraft(draft: TransporterRegistrationDraft): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DRAFT_LOCAL_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota errors
  }
}

export function clearLocalDraft(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(DRAFT_LOCAL_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function syncDraftToServer(draft: TransporterRegistrationDraft): Promise<void> {
  try {
    await fetch(`/api/registration/drafts/${encodeURIComponent(draft.draftId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
  } catch {
    // Local draft mirror preserves continuity even if offline
  }
}

export async function fetchServerDraft(
  draftId: string,
): Promise<TransporterRegistrationDraft | null> {
  try {
    const res = await fetch(`/api/registration/drafts/${encodeURIComponent(draftId)}`);
    if (!res.ok) return null;
    const payload = (await res.json()) as { ok: boolean; draft?: TransporterRegistrationDraft };
    return payload.ok && payload.draft ? payload.draft : null;
  } catch {
    return null;
  }
}

export function saveLocalSubmittedSummary(
  summary: SubmittedTransporterApplicationSummary,
): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SUBMITTED_LOCAL_KEY, JSON.stringify(summary));
  } catch {
    // Ignore
  }
}

export function loadLocalSubmittedSummary(): SubmittedTransporterApplicationSummary | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SUBMITTED_LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubmittedTransporterApplicationSummary;
  } catch {
    return null;
  }
}

export async function submitTransporterApplication(
  draft: TransporterRegistrationDraft,
): Promise<
  | { ok: true; application: SubmittedTransporterApplicationSummary }
  | { ok: false; message: string; errors?: Record<string, string> }
> {
  try {
    const res = await fetch('/api/registration/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const payload = (await res.json()) as {
      ok: boolean;
      application?: SubmittedTransporterApplicationSummary;
      message?: string;
      errors?: Record<string, string>;
    };
    if (!res.ok || !payload.ok || !payload.application) {
      return {
        ok: false,
        message: payload.message ?? 'Could not submit application.',
        errors: payload.errors,
      };
    }
    return { ok: true, application: payload.application };
  } catch {
    return {
      ok: false,
      message: 'Network error while submitting application. Please try again.',
    };
  }
}

export async function fetchSubmittedApplication(
  applicationId: string,
): Promise<SubmittedTransporterApplicationSummary | null> {
  try {
    const res = await fetch(
      `/api/registration/applications/${encodeURIComponent(applicationId)}`,
    );
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      ok: boolean;
      application?: SubmittedTransporterApplicationSummary;
    };
    return payload.ok && payload.application ? payload.application : null;
  } catch {
    return null;
  }
}
