import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  getDocumentRequirements,
  maskLicence,
  maskPan,
  normalizeIndianMobile,
  validateSubmittedApplicationPayload,
} from './src/features/registration/registrationValidation.ts';
import type {
  DocumentSlotKey,
  SubmittedTransporterApplicationSummary,
  TransporterRegistrationDraft,
} from './src/features/registration/registrationTypes.ts';

const PORT = Number(process.env.PORT) || 3000;
const PRIVATE_VAULT_ROOT = path.resolve(process.cwd(), '.orvex_private_storage');
const PRIVATE_DOCS_DIR = path.join(PRIVATE_VAULT_ROOT, 'documents');
const PRIVATE_DRAFTS_DIR = path.join(PRIVATE_VAULT_ROOT, 'drafts');
const APPLICATIONS_FILE = path.join(PRIVATE_VAULT_ROOT, 'applications.json');
const DOCUMENTS_INDEX_FILE = path.join(PRIVATE_VAULT_ROOT, 'documents-index.json');

interface PrivateDocumentIndexEntry {
  documentId: string;
  draftId: string;
  slotKey: DocumentSlotKey;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  diskFileName: string;
  proofSubType?: string;
}

interface StoredApplicationRecord {
  summary: SubmittedTransporterApplicationSummary;
  normalizedMobile: string;
  panHash: string;
  documentIds: string[];
  maskedDriverLicences: string[];
}

function isSafeIdentifier(value: string): boolean {
  return /^[a-zA-Z0-9_-]{6,64}$/.test(value);
}

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toUpperCase()).digest('hex');
}

async function ensurePrivateVault(): Promise<void> {
  await fs.mkdir(PRIVATE_DOCS_DIR, { recursive: true });
  await fs.mkdir(PRIVATE_DRAFTS_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await ensurePrivateVault();
  const tempPath = `${filePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
}

function sanitizeDraft(input: Record<string, unknown>): Partial<TransporterRegistrationDraft> {
  const clone = structuredClone(input) as Record<string, unknown>;
  delete clone.password;
  delete clone.confirmPassword;
  delete clone.otp;
  if (clone.account && typeof clone.account === 'object') {
    const acc = clone.account as Record<string, unknown>;
    delete acc.password;
    delete acc.confirmPassword;
    delete acc.otp;
  }
  return clone as Partial<TransporterRegistrationDraft>;
}

function extensionForMime(mimeType: string): string | null {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return null;
  }
}

async function generateUniqueApplicationId(
  existingApplications: StoredApplicationRecord[],
): Promise<string> {
  const year = new Date().getUTCFullYear();
  const usedIds = new Set(existingApplications.map((item) => item.summary.applicationId));
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const suffix = crypto.randomInt(100000, 999999);
    const candidate = `ORVEX-TR-${year}-${suffix}`;
    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }
  return `ORVEX-TR-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function startServer() {
  await ensurePrivateVault();

  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // 1. Honest OTP request endpoint (fails explicitly if SMS OTP gateway is not provisioned)
  app.post('/api/registration/otp/request', (_req, res) => {
    const isOtpConfigured = process.env.FIREBASE_AUTH_ENABLED === 'true';
    if (!isOtpConfigured) {
      res.status(503).json({
        ok: false,
        configured: false,
        code: 'OTP_PROVIDER_NOT_CONFIGURED',
        message:
          'SMS OTP service is not configured yet in this environment. You may continue completing your transporter registration details; OTP verification will activate once Firebase Authentication is connected.',
      });
      return;
    }
    res.status(501).json({
      ok: false,
      configured: false,
      code: 'OTP_PROVIDER_NOT_CONFIGURED',
      message: 'OTP provider adapter is not initialized.',
    });
  });

  // 2. Private document upload endpoint (no public URL exposure)
  app.post('/api/registration/documents', async (req, res) => {
    try {
      const {
        draftId,
        slotKey,
        fileName,
        mimeType,
        base64Data,
        proofSubType,
      } = req.body as {
        draftId?: string;
        slotKey?: DocumentSlotKey;
        fileName?: string;
        mimeType?: string;
        base64Data?: string;
        proofSubType?: string;
      };

      if (!draftId || !isSafeIdentifier(draftId) || !slotKey || !fileName || !mimeType || !base64Data) {
        res.status(400).json({ ok: false, message: 'Invalid document upload request.' });
        return;
      }

      const allowedMimes =
        slotKey === 'profilePhoto' ? ALLOWED_IMAGE_MIME_TYPES : ALLOWED_DOCUMENT_MIME_TYPES;
      if (!allowedMimes.includes(mimeType as never)) {
        res.status(400).json({
          ok: false,
          message:
            slotKey === 'profilePhoto'
              ? 'Profile photo must be JPG or PNG format.'
              : 'Document must be JPG, PNG, or PDF format.',
        });
        return;
      }

      const ext = extensionForMime(mimeType);
      if (!ext) {
        res.status(400).json({ ok: false, message: 'Unsupported document format.' });
        return;
      }

      const base64Clean = base64Data.includes(',') ? base64Data.split(',')[1] ?? '' : base64Data;
      const fileBuffer = Buffer.from(base64Clean, 'base64');

      if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > MAX_DOCUMENT_SIZE_BYTES) {
        res.status(413).json({
          ok: false,
          message: 'Document must be between 1 byte and 5 MB.',
        });
        return;
      }

      const documentId = `doc_${crypto.randomBytes(12).toString('hex')}`;
      const diskFileName = `${documentId}.${ext}`;
      const diskPath = path.join(PRIVATE_DOCS_DIR, diskFileName);
      await fs.writeFile(diskPath, fileBuffer);

      const safeFileName = path.basename(fileName).slice(0, 120);
      const uploadedAt = new Date().toISOString();

      const index = await readJsonFile<Record<string, PrivateDocumentIndexEntry>>(
        DOCUMENTS_INDEX_FILE,
        {},
      );
      index[documentId] = {
        documentId,
        draftId,
        slotKey,
        fileName: safeFileName,
        mimeType,
        sizeBytes: fileBuffer.byteLength,
        uploadedAt,
        diskFileName,
        proofSubType: typeof proofSubType === 'string' ? proofSubType.slice(0, 60) : undefined,
      };
      await writeJsonAtomic(DOCUMENTS_INDEX_FILE, index);

      res.status(201).json({
        ok: true,
        document: {
          documentId,
          slotKey,
          fileName: safeFileName,
          mimeType,
          sizeBytes: fileBuffer.byteLength,
          uploadedAt,
          status: 'Uploaded' as const,
          storageScope: 'private-server-vault' as const,
          proofSubType: index[documentId].proofSubType,
        },
      });
    } catch {
      res.status(500).json({ ok: false, message: 'Failed to store uploaded document securely.' });
    }
  });

  // 3. Delete uploaded private document
  app.delete('/api/registration/documents/:documentId', async (req, res) => {
    const { documentId } = req.params;
    if (!isSafeIdentifier(documentId)) {
      res.status(400).json({ ok: false, message: 'Invalid document identifier.' });
      return;
    }

    const index = await readJsonFile<Record<string, PrivateDocumentIndexEntry>>(
      DOCUMENTS_INDEX_FILE,
      {},
    );
    const entry = index[documentId];
    if (entry) {
      const targetPath = path.join(PRIVATE_DOCS_DIR, entry.diskFileName);
      await fs.rm(targetPath, { force: true });
      delete index[documentId];
      await writeJsonAtomic(DOCUMENTS_INDEX_FILE, index);
    }

    res.json({ ok: true });
  });

  // 4. Draft save & resume (never stores plaintext passwords or OTP values)
  app.put('/api/registration/drafts/:draftId', async (req, res) => {
    const { draftId } = req.params;
    if (!isSafeIdentifier(draftId) || !req.body || typeof req.body !== 'object') {
      res.status(400).json({ ok: false, message: 'Invalid draft payload.' });
      return;
    }
    const sanitized = sanitizeDraft(req.body as Record<string, unknown>);
    const updatedAt = new Date().toISOString();
    const record = { ...sanitized, draftId, updatedAt };
    await writeJsonAtomic(path.join(PRIVATE_DRAFTS_DIR, `${draftId}.json`), record);
    res.json({ ok: true, draft: record, updatedAt });
  });

  app.get('/api/registration/drafts/:draftId', async (req, res) => {
    const { draftId } = req.params;
    if (!isSafeIdentifier(draftId)) {
      res.status(400).json({ ok: false, message: 'Invalid draft identifier.' });
      return;
    }
    const draft = await readJsonFile<TransporterRegistrationDraft | null>(
      path.join(PRIVATE_DRAFTS_DIR, `${draftId}.json`),
      null,
    );
    if (!draft) {
      res.status(404).json({ ok: false, message: 'No saved registration draft found.' });
      return;
    }
    res.json({ ok: true, draft });
  });

  // 5. Submit Transporter Application (server-side validation + duplicate check + unique backend ID)
  app.post('/api/registration/applications', async (req, res) => {
    const draft = req.body as TransporterRegistrationDraft | undefined;
    if (!draft || typeof draft !== 'object') {
      res.status(400).json({ ok: false, message: 'Application payload is missing.' });
      return;
    }

    const validationErrors = validateSubmittedApplicationPayload(draft);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_FAILED',
        message: 'Please complete all required application fields and uploads.',
        errors: validationErrors,
      });
      return;
    }

    const docIndex = await readJsonFile<Record<string, PrivateDocumentIndexEntry>>(
      DOCUMENTS_INDEX_FILE,
      {},
    );
    const reqDocs = getDocumentRequirements(
      draft.transporterType,
      draft.companyDetails.constitution,
      draft.companyDetails.gstin,
    );

    const verifiedDocIds: string[] = [];
    const uploadedDocSummaries: SubmittedTransporterApplicationSummary['uploadedDocuments'] = [];

    for (const reqDoc of reqDocs) {
      const meta = draft.documents[reqDoc.slotKey];
      if (!meta) {
        if (reqDoc.required) {
          res.status(400).json({
            ok: false,
            code: 'MISSING_DOCUMENT',
            message: `${reqDoc.title} must be uploaded before submitting.`,
          });
          return;
        }
        continue;
      }

      const storedDoc = docIndex[meta.documentId];
      if (!storedDoc) {
        res.status(400).json({
          ok: false,
          code: 'INVALID_DOCUMENT_REF',
          message: `Uploaded file for ${reqDoc.title} could not be verified in private storage.`,
        });
        return;
      }

      verifiedDocIds.push(storedDoc.documentId);
      uploadedDocSummaries.push({
        slotKey: reqDoc.slotKey,
        label: reqDoc.title,
        fileName: storedDoc.fileName,
        status: 'Uploaded',
      });
    }

    const normalizedMobile = normalizeIndianMobile(draft.account.mobileNumber) ?? draft.account.mobileNumber;
    const rawPan =
      draft.transporterType === 'individual'
        ? draft.individualDetails.panNumber
        : draft.companyDetails.companyPan;
    const panHash = sha256Hex(rawPan);

    const applications = await readJsonFile<StoredApplicationRecord[]>(APPLICATIONS_FILE, []);
    const duplicate = applications.find(
      (item) =>
        (item.normalizedMobile === normalizedMobile || item.panHash === panHash) &&
        item.summary.verificationStatus !== 'Rejected',
    );
    if (duplicate) {
      res.status(409).json({
        ok: false,
        code: 'DUPLICATE_APPLICATION',
        message: `An application (${duplicate.summary.applicationId}) with this mobile number or PAN is already ${duplicate.summary.verificationStatus}.`,
      });
      return;
    }

    const applicationId = await generateUniqueApplicationId(applications);
    const submittedAt = new Date().toISOString();
    const applicantName =
      draft.transporterType === 'individual'
        ? draft.individualDetails.legalFullName.trim()
        : draft.companyDetails.legalBusinessName.trim();
    const city =
      draft.transporterType === 'individual'
        ? draft.individualDetails.city.trim()
        : draft.companyDetails.city.trim();
    const state =
      draft.transporterType === 'individual'
        ? draft.individualDetails.state.trim()
        : draft.companyDetails.state.trim();

    const summary: SubmittedTransporterApplicationSummary = {
      applicationId,
      submittedAt,
      verificationStatus: 'Under Verification',
      transporterType: draft.transporterType,
      applicantName,
      mobileNumber: normalizedMobile,
      email: draft.account.email.trim(),
      maskedPan: maskPan(rawPan),
      city,
      state,
      driverCount: draft.drivers.length,
      primaryDriverName: draft.drivers[0]?.fullName.trim() ?? '',
      uploadedDocuments: uploadedDocSummaries,
      bookingAccessAllowed: false,
      accountAuthStatus:
        process.env.FIREBASE_AUTH_ENABLED === 'true' ? 'verified' : 'pending_auth_provider',
      reviewNote:
        'Automated format checks passed. Waiting for ORVEX administrator verification before freight booking access is enabled.',
    };

    const record: StoredApplicationRecord = {
      summary,
      normalizedMobile,
      panHash,
      documentIds: verifiedDocIds,
      maskedDriverLicences: draft.drivers.map((d) => maskLicence(d.licenceNumber)),
    };

    applications.push(record);
    await writeJsonAtomic(APPLICATIONS_FILE, applications);

    if (isSafeIdentifier(draft.draftId)) {
      await fs.rm(path.join(PRIVATE_DRAFTS_DIR, `${draft.draftId}.json`), { force: true });
    }

    res.status(201).json({ ok: true, application: summary });
  });

  // 6. Retrieve real persisted application status (never exposes document bytes or PAN)
  app.get('/api/registration/applications/:applicationId', async (req, res) => {
    const { applicationId } = req.params;
    const applications = await readJsonFile<StoredApplicationRecord[]>(APPLICATIONS_FILE, []);
    const found = applications.find((item) => item.summary.applicationId === applicationId);
    if (!found) {
      res.status(404).json({ ok: false, message: 'Transporter application not found.' });
      return;
    }
    res.json({ ok: true, application: found.summary });
  });

  // Mount Vite dev middlewares or production static bundle
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ORVEX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ORVEX server:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
