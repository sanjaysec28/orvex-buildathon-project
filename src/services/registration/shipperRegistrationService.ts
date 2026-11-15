import type {
  ShipperRegistrationDraft,
  SubmittedShipperApplicationSummary,
} from '../../features/shipperRegistration/shipperTypes';
import {
  deleteRegistrationDocument,
  requestRegistrationOtp,
  uploadRegistrationDocument,
} from './transporterRegistrationService';

export const SHIPPER_DRAFT_LOCAL_KEY = 'orvex.shipper.registration.draft';
export const SHIPPER_SUBMITTED_LOCAL_KEY = 'orvex.shipper.registration.submitted';

export { deleteRegistrationDocument, requestRegistrationOtp, uploadRegistrationDocument };

export function loadLocalShipperDraft(): ShipperRegistrationDraft | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SHIPPER_DRAFT_LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShipperRegistrationDraft;
  } catch {
    return null;
  }
}

export function saveLocalShipperDraft(draft: ShipperRegistrationDraft): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SHIPPER_DRAFT_LOCAL_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearLocalShipperDraft(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(SHIPPER_DRAFT_LOCAL_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function syncShipperDraftToServer(draft: ShipperRegistrationDraft): Promise<void> {
  try {
    await fetch(`/api/shipper/registration/drafts/${encodeURIComponent(draft.draftId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
  } catch {
    // Local draft mirror preserves continuity even if offline
  }
}

export async function fetchShipperServerDraft(
  draftId: string,
): Promise<ShipperRegistrationDraft | null> {
  try {
    const res = await fetch(`/api/shipper/registration/drafts/${encodeURIComponent(draftId)}`);
    if (!res.ok) return null;
    const payload = (await res.json()) as { ok: boolean; draft?: ShipperRegistrationDraft };
    return payload.ok && payload.draft ? payload.draft : null;
  } catch {
    return null;
  }
}

export function saveLocalShipperSubmittedSummary(
  summary: SubmittedShipperApplicationSummary,
): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SHIPPER_SUBMITTED_LOCAL_KEY, JSON.stringify(summary));
  } catch {
    // Ignore
  }
}

export function loadLocalShipperSubmittedSummary(): SubmittedShipperApplicationSummary | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SHIPPER_SUBMITTED_LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubmittedShipperApplicationSummary;
  } catch {
    return null;
  }
}

export async function submitShipperApplication(
  draft: ShipperRegistrationDraft,
): Promise<
  | { ok: true; application: SubmittedShipperApplicationSummary }
  | { ok: false; message: string; errors?: Record<string, string> }
> {
  try {
    const res = await fetch('/api/shipper/registration/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const payload = (await res.json()) as {
      ok: boolean;
      application?: SubmittedShipperApplicationSummary;
      message?: string;
      errors?: Record<string, string>;
    };
    if (!res.ok || !payload.ok || !payload.application) {
      return {
        ok: false,
        message: payload.message ?? 'Could not submit shipper application.',
        errors: payload.errors,
      };
    }
    return { ok: true, application: payload.application };
  } catch {
    return {
      ok: false,
      message: 'Network error while submitting shipper application. Please try again.',
    };
  }
}

export async function fetchSubmittedShipperApplication(
  applicationId: string,
): Promise<SubmittedShipperApplicationSummary | null> {
  try {
    const res = await fetch(
      `/api/shipper/registration/applications/${encodeURIComponent(applicationId)}`,
    );
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      ok: boolean;
      application?: SubmittedShipperApplicationSummary;
    };
    return payload.ok && payload.application ? payload.application : null;
  } catch {
    return null;
  }
}
