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
import {
  getShipperDocumentRequirements,
  validateShipperSubmittedPayload,
} from './src/features/shipperRegistration/shipperValidation.ts';
import {
  computeCompatibleLoadsForFleet,
  isValidRegistrationNumber,
  normalizeRegistrationNumber,
} from './src/features/transporterDashboard/transporterDashboardUtils.ts';
import type {
  AuthenticatedUserSession,
  LoadOpportunity,
  ShipperDashboardOverview,
  ShipperDemoShipment,
  TransporterDriver,
  TransporterNotification,
  TransporterOffer,
  TransporterTrip,
  TransporterVaultDocument,
  TransporterVehicle,
} from './src/features/transporterDashboard/transporterDashboardTypes.ts';
import type {
  ShipperRegistrationDraft,
  SubmittedShipperApplicationSummary,
} from './src/features/shipperRegistration/shipperTypes.ts';
import {
  DEMO_SHIPPER_UID,
  DEMO_TRANSPORTER_UID,
  isDemoModeEnabledOnServer,
  isReservedDemoUid,
  resolveSessionCookieOptions,
} from './src/services/auth/demoAuthPolicy.ts';
import {
  DEMO_TRANSPORTER_LOADS,
  createInitialDemoShipperWorkspace,
  createInitialDemoTransporterWorkspace,
} from './src/services/demo/demoDatasets.ts';

const PORT = Number(process.env.PORT) || 3000;
const PRIVATE_VAULT_ROOT = path.resolve(process.cwd(), '.orvex_private_storage');
const PRIVATE_DOCS_DIR = path.join(PRIVATE_VAULT_ROOT, 'documents');
const PRIVATE_DRAFTS_DIR = path.join(PRIVATE_VAULT_ROOT, 'drafts');
const PRIVATE_SHIPPER_DRAFTS_DIR = path.join(PRIVATE_VAULT_ROOT, 'shipper-drafts');
const DEMO_STORAGE_DIR = path.join(PRIVATE_VAULT_ROOT, 'demo');
const DEMO_TRANSPORTER_FILE = path.join(DEMO_STORAGE_DIR, 'demo-transporter.json');
const DEMO_SHIPPER_FILE = path.join(DEMO_STORAGE_DIR, 'demo-shipper.json');
const APPLICATIONS_FILE = path.join(PRIVATE_VAULT_ROOT, 'applications.json');
const SHIPPER_APPLICATIONS_FILE = path.join(PRIVATE_VAULT_ROOT, 'shipper-applications.json');
const DOCUMENTS_INDEX_FILE = path.join(PRIVATE_VAULT_ROOT, 'documents-index.json');
const WORKSPACES_FILE = path.join(PRIVATE_VAULT_ROOT, 'transporter-workspaces.json');
const FREIGHT_LOADS_FILE = path.join(PRIVATE_VAULT_ROOT, 'freight-loads.json');
const SESSION_SECRET_FILE = path.join(PRIVATE_VAULT_ROOT, '.session-secret');
const SESSION_COOKIE_NAME = 'orvex_session';

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

interface StoredShipperApplicationRecord {
  summary: SubmittedShipperApplicationSummary;
  normalizedMobile: string;
  emailLower: string;
  panHash: string | null;
  documentIds: string[];
}

interface TransporterWorkspaceRecord {
  profile: AuthenticatedUserSession;
  vehicles: TransporterVehicle[];
  drivers: TransporterDriver[];
  trips: TransporterTrip[];
  offers: TransporterOffer[];
  notifications: TransporterNotification[];
  documents: TransporterVaultDocument[];
}

interface SignedSessionTokenPayload {
  uid: string;
  role: 'transporter' | 'shipper';
  isDemo?: boolean;
  exp: number;
}

let cachedSessionSecret: string | null = null;

async function getSessionSecret(): Promise<string> {
  if (process.env.ORVEX_SESSION_SECRET && process.env.ORVEX_SESSION_SECRET.length >= 16) {
    return process.env.ORVEX_SESSION_SECRET;
  }
  if (cachedSessionSecret) return cachedSessionSecret;
  await ensurePrivateVault();
  try {
    const existing = (await fs.readFile(SESSION_SECRET_FILE, 'utf8')).trim();
    if (existing.length >= 32) {
      cachedSessionSecret = existing;
      return existing;
    }
  } catch {
    // Generate fresh secret below
  }
  const generated = crypto.randomBytes(32).toString('hex');
  await fs.writeFile(SESSION_SECRET_FILE, generated, { encoding: 'utf8', mode: 0o600 });
  cachedSessionSecret = generated;
  return generated;
}

function signSessionToken(payload: SignedSessionTokenPayload, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string, secret: string): SignedSessionTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedSessionTokenPayload;
    if (!parsed.uid || (parsed.role !== 'transporter' && parsed.role !== 'shipper')) {
      return null;
    }
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parseCookies(headerValue: string | undefined): Record<string, string> {
  if (!headerValue) return {};
  const result: Record<string, string> = {};
  for (const part of headerValue.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) {
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

const DEFAULT_CORRIDOR_LOADS: LoadOpportunity[] = [
  {
    id: 'LD-MAA-BLR-401',
    originCity: 'Chennai',
    originState: 'TN',
    destinationCity: 'Bengaluru',
    destinationState: 'KA',
    cargoType: 'Textile Goods',
    requiredVehicleCategory: 'Closed Body',
    requiredLengthFt: '17 ft / 20 ft',
    weightTonnes: 8,
    expectedFreightInr: 72000,
    distanceKm: 346,
    pickupWindowLabel: 'Today, 7:00 PM',
    corridorTag: 'Chennai ↔ Bengaluru',
    compatibleVehicleIds: [],
  },
  {
    id: 'LD-CJB-HYD-402',
    originCity: 'Coimbatore',
    originState: 'TN',
    destinationCity: 'Hyderabad',
    destinationState: 'TG',
    cargoType: 'Machinery Parts',
    requiredVehicleCategory: 'Trailer',
    requiredLengthFt: '32 ft',
    weightTonnes: 16,
    expectedFreightInr: 118000,
    distanceKm: 882,
    pickupWindowLabel: 'Tomorrow, 8:30 AM',
    corridorTag: 'South Corridor',
    compatibleVehicleIds: [],
  },
  {
    id: 'LD-BLR-MAA-403',
    originCity: 'Bengaluru',
    originState: 'KA',
    destinationCity: 'Chennai',
    destinationState: 'TN',
    cargoType: 'Auto Components',
    requiredVehicleCategory: 'Closed Body',
    requiredLengthFt: '17 ft / 20 ft',
    weightTonnes: 7,
    expectedFreightInr: 68500,
    distanceKm: 348,
    pickupWindowLabel: 'Tomorrow, 2:00 PM',
    corridorTag: 'Chennai ↔ Bengaluru',
    compatibleVehicleIds: [],
  },
  {
    id: 'LD-HOS-MAA-404',
    originCity: 'Hosur',
    originState: 'TN',
    destinationCity: 'Chennai',
    destinationState: 'TN',
    cargoType: 'FMCG Cartons',
    requiredVehicleCategory: 'Open Body',
    requiredLengthFt: '14 ft / 20 ft',
    weightTonnes: 6,
    expectedFreightInr: 54000,
    distanceKm: 310,
    pickupWindowLabel: 'Tomorrow, 5:00 PM',
    corridorTag: 'Chennai ↔ Bengaluru',
    compatibleVehicleIds: [],
  },
];

async function ensureFreightCatalog(): Promise<LoadOpportunity[]> {
  const existing = await readJsonFile<LoadOpportunity[] | null>(FREIGHT_LOADS_FILE, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  await writeJsonAtomic(FREIGHT_LOADS_FILE, DEFAULT_CORRIDOR_LOADS);
  return DEFAULT_CORRIDOR_LOADS;
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
  await fs.mkdir(PRIVATE_SHIPPER_DRAFTS_DIR, { recursive: true });
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

async function generateUniqueShipperApplicationId(
  existingApplications: StoredShipperApplicationRecord[],
): Promise<string> {
  const year = new Date().getUTCFullYear();
  const usedIds = new Set(existingApplications.map((item) => item.summary.applicationId));
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const suffix = crypto.randomInt(100000, 999999);
    const candidate = `ORVEX-SHP-${year}-${suffix}`;
    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }
  return `ORVEX-SHP-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function startServer() {
  await ensurePrivateVault();
  const sessionSecret = await getSessionSecret();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '8mb' }));

  function resolveTokenPayloadFromRequest(req: express.Request): SignedSessionTokenPayload | null {
    const cookies = parseCookies(req.headers.cookie);
    const authHeader = req.headers.authorization;
    const bearer =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;
    const rawToken = bearer ?? cookies[SESSION_COOKIE_NAME];
    if (!rawToken) return null;
    return verifySessionToken(rawToken, sessionSecret);
  }

  // Prevent demo sessions from reading/writing real registration applications or KYC documents
  app.use(['/api/registration', '/api/shipper/registration'], (req, res, next) => {
    const payload = resolveTokenPayloadFromRequest(req);
    if (payload?.isDemo) {
      res.status(403).json({
        ok: false,
        code: 'DEMO_SESSION_RESTRICTED',
        message: 'Demo sessions cannot access real registration or document records.',
      });
      return;
    }
    next();
  });

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

  // 7. Shipper registration draft persistence (strips password & OTP fields defensively)
  app.put('/api/shipper/registration/drafts/:draftId', async (req, res) => {
    const { draftId } = req.params;
    if (!isSafeIdentifier(draftId) || !req.body || typeof req.body !== 'object') {
      res.status(400).json({ ok: false, message: 'Invalid shipper draft payload.' });
      return;
    }
    const sanitized = sanitizeDraft(req.body as Record<string, unknown>);
    const updatedAt = new Date().toISOString();
    const record = { ...sanitized, draftId, updatedAt };
    await writeJsonAtomic(path.join(PRIVATE_SHIPPER_DRAFTS_DIR, `${draftId}.json`), record);
    res.json({ ok: true, draft: record, updatedAt });
  });

  app.get('/api/shipper/registration/drafts/:draftId', async (req, res) => {
    const { draftId } = req.params;
    if (!isSafeIdentifier(draftId)) {
      res.status(400).json({ ok: false, message: 'Invalid shipper draft identifier.' });
      return;
    }
    const draft = await readJsonFile<ShipperRegistrationDraft | null>(
      path.join(PRIVATE_SHIPPER_DRAFTS_DIR, `${draftId}.json`),
      null,
    );
    if (!draft) {
      res.status(404).json({ ok: false, message: 'No saved shipper draft found.' });
      return;
    }
    res.json({ ok: true, draft });
  });

  // 8. Submit Shipper Application (server validation + duplicate check + ORVEX-SHP ID)
  app.post('/api/shipper/registration/applications', async (req, res) => {
    const draft = req.body as ShipperRegistrationDraft | undefined;
    if (!draft || typeof draft !== 'object') {
      res.status(400).json({ ok: false, message: 'Shipper application payload is missing.' });
      return;
    }

    const validationErrors = validateShipperSubmittedPayload(draft);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_FAILED',
        message: 'Please complete all required business, shipping profile, and document fields.',
        errors: validationErrors,
      });
      return;
    }

    const docIndex = await readJsonFile<Record<string, PrivateDocumentIndexEntry>>(
      DOCUMENTS_INDEX_FILE,
      {},
    );
    const gstin =
      draft.businessType === 'company' ? draft.companyDetails.gstin : draft.individualDetails.gstin;
    const reqDocs = getShipperDocumentRequirements(
      draft.businessType,
      draft.companyDetails.constitution,
      draft.individualDetails.panNumber,
      gstin,
    );

    const verifiedDocIds: string[] = [];
    const uploadedDocSummaries: SubmittedShipperApplicationSummary['uploadedDocuments'] = [];

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

    const normalizedMobile =
      normalizeIndianMobile(draft.account.mobileNumber) ?? draft.account.mobileNumber;
    const emailLower = draft.account.email.trim().toLowerCase();
    const rawPan =
      draft.businessType === 'company'
        ? draft.companyDetails.companyPan.trim()
        : draft.individualDetails.panNumber.trim();
    const panHash = rawPan ? sha256Hex(rawPan) : null;

    const applications = await readJsonFile<StoredShipperApplicationRecord[]>(
      SHIPPER_APPLICATIONS_FILE,
      [],
    );
    const duplicate = applications.find(
      (item) =>
        (item.normalizedMobile === normalizedMobile ||
          item.emailLower === emailLower ||
          (panHash !== null && item.panHash === panHash)) &&
        item.summary.verificationStatus !== 'Rejected',
    );
    if (duplicate) {
      res.status(409).json({
        ok: false,
        code: 'DUPLICATE_APPLICATION',
        message: `A shipper application (${duplicate.summary.applicationId}) with this mobile number, email, or PAN is already ${duplicate.summary.verificationStatus}.`,
      });
      return;
    }

    const applicationId = await generateUniqueShipperApplicationId(applications);
    const submittedAt = new Date().toISOString();
    const businessType = draft.businessType === 'company' ? 'company' : 'individual';
    const businessName =
      businessType === 'company'
        ? draft.companyDetails.legalCompanyName.trim()
        : draft.individualDetails.businessShopName.trim();
    const businessCategory =
      businessType === 'company'
        ? draft.companyDetails.businessCategory
        : draft.individualDetails.businessCategory;
    const city =
      businessType === 'company'
        ? draft.companyDetails.city.trim()
        : draft.individualDetails.city.trim();
    const state =
      businessType === 'company'
        ? draft.companyDetails.state.trim()
        : draft.individualDetails.state.trim();

    const summary: SubmittedShipperApplicationSummary = {
      applicationId,
      submittedAt,
      verificationStatus: 'Under Verification',
      businessType,
      businessName,
      businessCategory,
      applicantName: draft.account.fullName.trim(),
      mobileNumber: normalizedMobile,
      email: draft.account.email.trim(),
      maskedPan: rawPan ? maskPan(rawPan) : null,
      city,
      state,
      shippingProfile: {
        mainGoodsCategory: draft.shippingProfile.mainGoodsCategory,
        typicalCargo: [...draft.shippingProfile.typicalCargo],
        averageWeightLabel: `${draft.shippingProfile.averageWeightValue} ${draft.shippingProfile.averageWeightUnit}`,
        preferredVehicleTypes: [...draft.shippingProfile.preferredVehicleTypes],
        primaryPickupLocation: draft.shippingProfile.primaryPickupLocation.trim(),
        regularDeliveryLocations: [...draft.shippingProfile.regularDeliveryLocations],
        shipmentFrequency: draft.shippingProfile.shipmentFrequency,
      },
      uploadedDocuments: uploadedDocSummaries,
      bookingAccessAllowed: false,
      accountAuthStatus:
        process.env.FIREBASE_AUTH_ENABLED === 'true' ? 'verified' : 'pending_auth_provider',
      reviewNote:
        'Automated format checks passed. Waiting for ORVEX verification review before shipment posting access is enabled.',
    };

    const record: StoredShipperApplicationRecord = {
      summary,
      normalizedMobile,
      emailLower,
      panHash,
      documentIds: verifiedDocIds,
    };

    applications.push(record);
    await writeJsonAtomic(SHIPPER_APPLICATIONS_FILE, applications);

    if (isSafeIdentifier(draft.draftId)) {
      await fs.rm(path.join(PRIVATE_SHIPPER_DRAFTS_DIR, `${draft.draftId}.json`), {
        force: true,
      });
    }

    res.status(201).json({ ok: true, application: summary });
  });

  // 9. Retrieve persisted Shipper application status (never exposes raw document bytes)
  app.get('/api/shipper/registration/applications/:applicationId', async (req, res) => {
    const { applicationId } = req.params;
    const applications = await readJsonFile<StoredShipperApplicationRecord[]>(
      SHIPPER_APPLICATIONS_FILE,
      [],
    );
    const found = applications.find((item) => item.summary.applicationId === applicationId);
    if (!found) {
      res.status(404).json({ ok: false, message: 'Shipper application not found.' });
      return;
    }
    res.json({ ok: true, application: found.summary });
  });

  async function ensureDemoTransporterWorkspace(): Promise<TransporterWorkspaceRecord> {
    const existing = await readJsonFile<TransporterWorkspaceRecord | null>(
      DEMO_TRANSPORTER_FILE,
      null,
    );
    if (existing && existing.profile?.uid === DEMO_TRANSPORTER_UID && existing.profile.isDemo) {
      return existing;
    }
    const fresh = createInitialDemoTransporterWorkspace();
    await fs.mkdir(DEMO_STORAGE_DIR, { recursive: true });
    await writeJsonAtomic(DEMO_TRANSPORTER_FILE, fresh);
    return fresh;
  }

  async function ensureDemoShipperWorkspace(): Promise<ShipperDashboardOverview> {
    const existing = await readJsonFile<ShipperDashboardOverview | null>(DEMO_SHIPPER_FILE, null);
    if (existing && existing.profile?.uid === DEMO_SHIPPER_UID && existing.profile.isDemo) {
      return existing;
    }
    const fresh = createInitialDemoShipperWorkspace();
    await fs.mkdir(DEMO_STORAGE_DIR, { recursive: true });
    await writeJsonAtomic(DEMO_SHIPPER_FILE, fresh);
    return fresh;
  }

  async function resolveSessionProfileFromRequest(
    req: express.Request,
  ): Promise<{ payload: SignedSessionTokenPayload; profile: AuthenticatedUserSession } | null> {
    const payload = resolveTokenPayloadFromRequest(req);
    if (!payload) return null;

    if (payload.isDemo) {
      if (!isDemoModeEnabledOnServer()) {
        return null;
      }
      if (payload.role === 'transporter' && payload.uid === DEMO_TRANSPORTER_UID) {
        const demoTx = await ensureDemoTransporterWorkspace();
        return { payload, profile: demoTx.profile };
      }
      if (payload.role === 'shipper' && payload.uid === DEMO_SHIPPER_UID) {
        const demoShp = await ensureDemoShipperWorkspace();
        return { payload, profile: demoShp.profile };
      }
      return null;
    }

    if (isReservedDemoUid(payload.uid)) {
      return null;
    }

    const workspaces = await readJsonFile<Record<string, TransporterWorkspaceRecord>>(
      WORKSPACES_FILE,
      {},
    );
    const workspace = workspaces[payload.uid];
    if (!workspace) return null;
    return { payload, profile: workspace.profile };
  }

  async function resolveSessionFromRequest(req: express.Request): Promise<TransporterWorkspaceRecord | null> {
    const payload = resolveTokenPayloadFromRequest(req);
    if (!payload) return null;

    if (payload.isDemo) {
      if (!isDemoModeEnabledOnServer()) {
        return null;
      }
      if (payload.role === 'transporter' && payload.uid === DEMO_TRANSPORTER_UID) {
        return ensureDemoTransporterWorkspace();
      }
      if (payload.role === 'shipper' && payload.uid === DEMO_SHIPPER_UID) {
        const demoShp = await ensureDemoShipperWorkspace();
        return {
          profile: demoShp.profile,
          vehicles: [],
          drivers: [],
          trips: [],
          offers: [],
          notifications: [],
          documents: [],
        };
      }
      return null;
    }

    if (isReservedDemoUid(payload.uid)) {
      return null;
    }

    const workspaces = await readJsonFile<Record<string, TransporterWorkspaceRecord>>(
      WORKSPACES_FILE,
      {},
    );
    return workspaces[payload.uid] ?? null;
  }

  async function requireApprovedTransporter(
    req: express.Request,
    res: express.Response,
  ): Promise<TransporterWorkspaceRecord | null> {
    const workspace = await resolveSessionFromRequest(req);
    if (!workspace) {
      res.status(401).json({
        ok: false,
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access the Transporter Dashboard.',
      });
      return null;
    }

    if (workspace.profile.role !== 'transporter') {
      res.status(403).json({
        ok: false,
        code: 'ROLE_MISMATCH',
        message: 'Only authenticated Transporter accounts can access this workspace.',
      });
      return null;
    }

    const isApproved =
      workspace.profile.bookingAccessAllowed &&
      (workspace.profile.isDemo
        ? isDemoModeEnabledOnServer() && workspace.profile.verificationStatus === 'Demo Verified'
        : workspace.profile.verificationStatus === 'Verified');

    if (!isApproved) {
      res.status(403).json({
        ok: false,
        code: 'TRANSPORTER_NOT_VERIFIED',
        verificationStatus: workspace.profile.verificationStatus,
        message: 'Your transporter verification must be approved before opening operational workflows.',
      });
      return null;
    }

    return workspace;
  }

  async function requireApprovedShipper(
    req: express.Request,
    res: express.Response,
  ): Promise<{ profile: AuthenticatedUserSession; isDemo: boolean } | null> {
    const resolved = await resolveSessionProfileFromRequest(req);
    if (!resolved) {
      res.status(401).json({
        ok: false,
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access the Shipper Dashboard.',
      });
      return null;
    }

    if (resolved.profile.role !== 'shipper') {
      res.status(403).json({
        ok: false,
        code: 'ROLE_MISMATCH',
        message: 'Only authenticated Shipper accounts can access this workspace.',
      });
      return null;
    }

    const isDemo = resolved.payload.isDemo === true && resolved.profile.isDemo === true;
    const isApproved =
      resolved.profile.bookingAccessAllowed &&
      (isDemo
        ? isDemoModeEnabledOnServer() && resolved.profile.verificationStatus === 'Demo Verified'
        : resolved.profile.verificationStatus === 'Verified');

    if (!isApproved) {
      res.status(403).json({
        ok: false,
        code: 'SHIPPER_NOT_VERIFIED',
        verificationStatus: resolved.profile.verificationStatus,
        message: 'Your shipper verification must be approved before opening operational workflows.',
      });
      return null;
    }

    return { profile: resolved.profile, isDemo };
  }

  async function saveWorkspaceRecord(record: TransporterWorkspaceRecord): Promise<void> {
    if (record.profile.isDemo || isReservedDemoUid(record.profile.uid)) {
      if (record.profile.uid !== DEMO_TRANSPORTER_UID) {
        throw new Error('Invalid demo workspace target.');
      }
      await fs.mkdir(DEMO_STORAGE_DIR, { recursive: true });
      await writeJsonAtomic(DEMO_TRANSPORTER_FILE, record);
      return;
    }
    const all = await readJsonFile<Record<string, TransporterWorkspaceRecord>>(WORKSPACES_FILE, {});
    all[record.profile.uid] = record;
    await writeJsonAtomic(WORKSPACES_FILE, all);
  }

  // 10. Auth session inspection, temporary dev demo login, & logout
  app.get('/api/auth/session', async (req, res) => {
    const demoModeEnabled = isDemoModeEnabledOnServer();
    const resolved = await resolveSessionProfileFromRequest(req);
    if (!resolved) {
      res.json({
        ok: true,
        authenticated: false,
        user: null,
        demoModeEnabled,
      });
      return;
    }
    res.json({
      ok: true,
      authenticated: true,
      user: resolved.profile,
      demoModeEnabled,
    });
  });

  app.post('/api/auth/demo-login', async (req, res) => {
    if (!isDemoModeEnabledOnServer()) {
      res.status(403).json({
        ok: false,
        code: 'DEMO_MODE_DISABLED',
        message: 'Temporary Demo Login Mode is disabled in production environments.',
      });
      return;
    }

    const requestedRole = (req.body as { role?: unknown } | undefined)?.role;
    if (requestedRole !== 'transporter' && requestedRole !== 'shipper') {
      res.status(400).json({
        ok: false,
        code: 'INVALID_DEMO_ROLE',
        message: 'Specify either "transporter" or "shipper" for demo login.',
      });
      return;
    }

    const expMs = 1000 * 60 * 60 * 8;
    if (requestedRole === 'transporter') {
      const demoWorkspace = await ensureDemoTransporterWorkspace();
      const token = signSessionToken(
        {
          uid: DEMO_TRANSPORTER_UID,
          role: 'transporter',
          isDemo: true,
          exp: Date.now() + expMs,
        },
        sessionSecret,
      );
      res.cookie(
        SESSION_COOKIE_NAME,
        token,
        resolveSessionCookieOptions(req, expMs) as express.CookieOptions,
      );
      res.status(201).json({ ok: true, user: demoWorkspace.profile });
      return;
    }

    const demoShipper = await ensureDemoShipperWorkspace();
    const token = signSessionToken(
      {
        uid: DEMO_SHIPPER_UID,
        role: 'shipper',
        isDemo: true,
        exp: Date.now() + expMs,
      },
      sessionSecret,
    );
    res.cookie(
      SESSION_COOKIE_NAME,
      token,
      resolveSessionCookieOptions(req, expMs) as express.CookieOptions,
    );
    res.status(201).json({ ok: true, user: demoShipper.profile });
  });

  app.post('/api/auth/logout', (req, res) => {
    const reqCookieOpts = resolveSessionCookieOptions(req);
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      sameSite: reqCookieOpts.sameSite,
      secure: reqCookieOpts.secure,
      ...(reqCookieOpts.partitioned ? { partitioned: true } : {}),
    } as express.CookieOptions);
    res.json({ ok: true });
  });

  // Server-secret gated test/provisioning session helper (never callable without host secret)
  app.post('/api/internal/test-session', async (req, res) => {
    const providedSecret = String(req.headers['x-orvex-server-secret'] ?? '');
    const providedBuf = Buffer.from(providedSecret);
    const expectedBuf = Buffer.from(sessionSecret);
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      res.status(403).json({ ok: false, message: 'Forbidden.' });
      return;
    }

    const body = req.body as Partial<{
      uid: string;
      role: 'transporter' | 'shipper';
      displayName: string;
      mobileNumber: string;
      email: string;
      companyName: string;
      city: string;
      state: string;
      verificationStatus: AuthenticatedUserSession['verificationStatus'];
      bookingAccessAllowed: boolean;
      applicationId: string;
      reviewNote: string;
      vehicles: TransporterVehicle[];
      drivers: TransporterDriver[];
      trips: TransporterTrip[];
      notifications: TransporterNotification[];
      documents: TransporterVaultDocument[];
    }>;

    const uid = body.uid && isSafeIdentifier(body.uid) ? body.uid : `tr_${crypto.randomBytes(6).toString('hex')}`;
    const role = body.role === 'shipper' ? 'shipper' : 'transporter';
    const verificationStatus = body.verificationStatus ?? 'Verified';
    const bookingAccessAllowed =
      typeof body.bookingAccessAllowed === 'boolean'
        ? body.bookingAccessAllowed
        : verificationStatus === 'Verified';

    const workspace: TransporterWorkspaceRecord = {
      profile: {
        uid,
        role,
        displayName: body.displayName?.trim() || 'Transporter Partner',
        mobileNumber: body.mobileNumber?.trim() || '+919876543210',
        email: body.email?.trim(),
        companyName: body.companyName?.trim(),
        city: body.city?.trim() || 'Chennai',
        state: body.state?.trim() || 'Tamil Nadu',
        verificationStatus,
        bookingAccessAllowed,
        applicationId: body.applicationId,
        reviewNote: body.reviewNote,
        authProvider: 'orvex-session',
      },
      vehicles: Array.isArray(body.vehicles) ? body.vehicles : [],
      drivers: Array.isArray(body.drivers) ? body.drivers : [],
      trips: Array.isArray(body.trips) ? body.trips : [],
      offers: [],
      notifications: Array.isArray(body.notifications) ? body.notifications : [],
      documents: Array.isArray(body.documents) ? body.documents : [],
    };

    await saveWorkspaceRecord(workspace);
    const token = signSessionToken(
      { uid, role, exp: Date.now() + 1000 * 60 * 60 * 12 },
      sessionSecret,
    );
    res.cookie(
      SESSION_COOKIE_NAME,
      token,
      resolveSessionCookieOptions(req, 1000 * 60 * 60 * 12) as express.CookieOptions,
    );
    res.status(201).json({ ok: true, user: workspace.profile });
  });

  // 11. Protected Transporter Dashboard overview
  app.get('/api/transporter/dashboard', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const catalog = workspace.profile.isDemo
      ? DEMO_TRANSPORTER_LOADS
      : await ensureFreightCatalog();
    const offerLoadIds = new Set(workspace.offers.map((o) => o.loadId));
    const loadsWithOfferFlag = catalog.map((l) => ({
      ...l,
      offerSubmitted: offerLoadIds.has(l.id),
    }));
    const recommendedLoads = computeCompatibleLoadsForFleet({
      vehicles: workspace.vehicles,
      trips: workspace.trips,
      loads: loadsWithOfferFlag,
    });

    const activeTrips = workspace.trips.filter(
      (t) => t.status === 'In Transit' || t.status === 'Loading',
    );
    const monthlyEarningsInr = workspace.trips
      .filter((t) => t.status === 'Completed')
      .reduce((acc, t) => acc + t.freightInr, 0);

    const activeTripWithReturn = activeTrips[0] ?? null;

    res.json({
      ok: true,
      overview: {
        profile: workspace.profile,
        metrics: {
          totalVehicles: workspace.vehicles.length,
          availableVehicles: workspace.vehicles.filter((v) => v.availabilityStatus === 'Available')
            .length,
          activeTrips: activeTrips.length,
          monthlyEarningsInr,
        },
        vehicles: workspace.vehicles,
        drivers: workspace.drivers,
        recommendedLoads,
        notifications: workspace.notifications,
        unreadNotificationCount: workspace.notifications.filter((n) => !n.read).length,
        activeReturnCorridor: activeTripWithReturn
          ? {
              originCity: activeTripWithReturn.destinationCity,
              destinationCity: activeTripWithReturn.originCity,
            }
          : null,
        mapsConfigured: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
      },
    });
  });

  // 12. Vehicles CRUD & availability
  app.get('/api/transporter/vehicles', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    res.json({ ok: true, vehicles: workspace.vehicles });
  });

  app.post('/api/transporter/vehicles', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const { registrationNumber, vehicleCategory, lengthFt, capacityTonnes, currentCity, availabilityStatus } =
      req.body as {
        registrationNumber?: string;
        vehicleCategory?: TransporterVehicle['vehicleCategory'];
        lengthFt?: TransporterVehicle['lengthFt'];
        capacityTonnes?: number;
        currentCity?: string;
        availabilityStatus?: TransporterVehicle['availabilityStatus'];
      };

    if (!registrationNumber || !isValidRegistrationNumber(registrationNumber)) {
      res.status(400).json({
        ok: false,
        message: 'Enter a valid Indian vehicle registration number (e.g., TN 02 AB 4567).',
      });
      return;
    }

    const normalizedReg = normalizeRegistrationNumber(registrationNumber);
    if (workspace.vehicles.some((v) => v.registrationNumber === normalizedReg)) {
      res.status(409).json({
        ok: false,
        message: `Vehicle ${normalizedReg} is already registered in your fleet.`,
      });
      return;
    }

    const validCategories = ['Closed Body', 'Open Body', 'Container', 'Trailer', 'Refrigerated'];
    const validLengths = ['14 ft', '17 ft', '20 ft', '32 ft'];
    const parsedCapacity = Number(capacityTonnes);
    if (
      !vehicleCategory ||
      !validCategories.includes(vehicleCategory) ||
      !lengthFt ||
      !validLengths.includes(lengthFt) ||
      !Number.isFinite(parsedCapacity) ||
      parsedCapacity <= 0
    ) {
      res.status(400).json({ ok: false, message: 'Complete vehicle type, length, and valid capacity.' });
      return;
    }

    const newVehicle: TransporterVehicle = {
      id: `veh_${crypto.randomBytes(5).toString('hex')}`,
      registrationNumber: normalizedReg,
      vehicleCategory,
      lengthFt,
      capacityTonnes: parsedCapacity,
      availabilityStatus: availabilityStatus ?? 'Available',
      currentCity: currentCity?.trim() || workspace.profile.city || 'Chennai',
      createdAt: new Date().toISOString(),
    };

    workspace.vehicles.unshift(newVehicle);
    workspace.notifications.unshift({
      id: `ntf_${crypto.randomBytes(4).toString('hex')}`,
      title: 'Vehicle Added to Fleet',
      message: `${normalizedReg} (${lengthFt} · ${vehicleCategory}) is now listed under your vehicles.`,
      category: 'load',
      read: false,
      createdAt: new Date().toISOString(),
      targetPath: '/transporter/vehicles',
    });
    await saveWorkspaceRecord(workspace);

    res.status(201).json({ ok: true, vehicle: newVehicle });
  });

  app.put('/api/transporter/vehicles/:vehicleId/availability', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const { vehicleId } = req.params;
    const { availabilityStatus, currentCity, availableFrom } = req.body as {
      availabilityStatus?: TransporterVehicle['availabilityStatus'];
      currentCity?: string;
      availableFrom?: string;
    };

    const vehicle = workspace.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      res.status(404).json({ ok: false, message: 'Vehicle not found.' });
      return;
    }

    const allowedStatuses = ['Available', 'On Trip', 'Unavailable', 'Pending Verification'];
    if (!availabilityStatus || !allowedStatuses.includes(availabilityStatus)) {
      res.status(400).json({ ok: false, message: 'Select a valid availability status.' });
      return;
    }

    vehicle.availabilityStatus = availabilityStatus;
    if (currentCity && currentCity.trim().length >= 2) {
      vehicle.currentCity = currentCity.trim();
    }
    vehicle.availableFrom = availableFrom?.trim() || undefined;
    await saveWorkspaceRecord(workspace);
    res.json({ ok: true, vehicle });
  });

  // 13. Drivers CRUD
  app.get('/api/transporter/drivers', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    res.json({ ok: true, drivers: workspace.drivers });
  });

  app.post('/api/transporter/drivers', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const { fullName, mobileNumber, licenceNumber, licenceExpiry, licenceCategory, assignedVehicleId } =
      req.body as {
        fullName?: string;
        mobileNumber?: string;
        licenceNumber?: string;
        licenceExpiry?: string;
        licenceCategory?: string;
        assignedVehicleId?: string;
      };

    const normalizedPhone = mobileNumber ? normalizeIndianMobile(mobileNumber) : null;
    if (!fullName || fullName.trim().length < 2 || !normalizedPhone || !licenceNumber || licenceNumber.trim().length < 8) {
      res.status(400).json({ ok: false, message: 'Provide valid driver name, mobile number, and driving licence.' });
      return;
    }

    const newDriver: TransporterDriver = {
      id: `drv_${crypto.randomBytes(5).toString('hex')}`,
      fullName: fullName.trim(),
      mobileNumber: normalizedPhone,
      licenceNumber: licenceNumber.trim().toUpperCase(),
      licenceExpiry: licenceExpiry?.trim() || '',
      licenceCategory: licenceCategory?.trim() || 'HMV',
      assignedVehicleId: assignedVehicleId || undefined,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    workspace.drivers.unshift(newDriver);
    await saveWorkspaceRecord(workspace);
    res.status(201).json({ ok: true, driver: newDriver });
  });

  // 14. Load Discovery, Return-Load filtering, and Load Detail + Offer submission
  app.get('/api/transporter/loads', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const catalog = workspace.profile.isDemo
      ? DEMO_TRANSPORTER_LOADS
      : await ensureFreightCatalog();
    const offerLoadIds = new Set(workspace.offers.map((o) => o.loadId));
    const enrichedCatalog = catalog.map((load) => ({
      ...load,
      offerSubmitted: offerLoadIds.has(load.id),
    }));

    const mode = typeof req.query.mode === 'string' ? req.query.mode : '';
    const origin = typeof req.query.origin === 'string' ? req.query.origin.trim().toLowerCase() : '';
    const destination =
      typeof req.query.destination === 'string' ? req.query.destination.trim().toLowerCase() : '';
    const vehicleCategory =
      typeof req.query.vehicleCategory === 'string' ? req.query.vehicleCategory.trim() : '';

    const activeTrips = workspace.trips.filter(
      (t) => t.status === 'In Transit' || t.status === 'Loading',
    );
    const activeTripWithReturn = activeTrips[0] ?? null;

    const compatible = computeCompatibleLoadsForFleet({
      vehicles: workspace.vehicles,
      trips: workspace.trips,
      loads: enrichedCatalog,
    });
    const compatibleIds = new Set(compatible.map((c) => c.id));

    let filtered = enrichedCatalog.map((item) => {
      const matched = compatible.find((c) => c.id === item.id);
      return matched ?? item;
    });

    if (mode === 'return') {
      const returnOrigins = new Set(
        activeTrips.map((t) => t.destinationCity.toLowerCase()),
      );
      if (origin) returnOrigins.add(origin);
      filtered = filtered.filter((load) => {
        if (returnOrigins.size > 0) {
          return (
            returnOrigins.has(load.originCity.toLowerCase()) ||
            load.isReturnMatch ||
            compatibleIds.has(load.id)
          );
        }
        return load.corridorTag.includes('Chennai') || compatibleIds.has(load.id);
      });
    } else if (origin) {
      filtered = filtered.filter((l) => l.originCity.toLowerCase().includes(origin));
    }

    if (destination) {
      filtered = filtered.filter((l) => l.destinationCity.toLowerCase().includes(destination));
    }
    if (vehicleCategory) {
      filtered = filtered.filter((l) => l.requiredVehicleCategory === vehicleCategory);
    }

    res.json({
      ok: true,
      loads: filtered,
      returnContext: activeTripWithReturn
        ? {
            originCity: activeTripWithReturn.destinationCity,
            destinationCity: activeTripWithReturn.originCity,
          }
        : null,
    });
  });

  app.get('/api/transporter/loads/:loadId', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const catalog = workspace.profile.isDemo
      ? DEMO_TRANSPORTER_LOADS
      : await ensureFreightCatalog();
    const load = catalog.find((l) => l.id === req.params.loadId);
    if (!load) {
      res.status(404).json({ ok: false, message: 'Load opportunity not found.' });
      return;
    }

    const compatible = computeCompatibleLoadsForFleet({
      vehicles: workspace.vehicles,
      trips: workspace.trips,
      loads: [load],
    })[0];
    const compatibleVehicleIds = new Set(compatible?.compatibleVehicleIds ?? []);
    const compatibleVehicles = workspace.vehicles.filter((v) => compatibleVehicleIds.has(v.id));
    const offerSubmitted = workspace.offers.some((o) => o.loadId === load.id);

    res.json({
      ok: true,
      load: {
        ...(compatible ?? load),
        offerSubmitted,
      },
      compatibleVehicles,
    });
  });

  app.post('/api/transporter/offers', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;

    const { loadId, proposedFreightInr, vehicleId, notes } = req.body as {
      loadId?: string;
      proposedFreightInr?: number;
      vehicleId?: string;
      notes?: string;
    };

    const catalog = workspace.profile.isDemo
      ? DEMO_TRANSPORTER_LOADS
      : await ensureFreightCatalog();
    const load = catalog.find((l) => l.id === loadId);
    if (!load) {
      res.status(404).json({ ok: false, message: 'Referenced load does not exist.' });
      return;
    }

    const vehicle = workspace.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      res.status(400).json({ ok: false, message: 'Select a valid vehicle from your fleet.' });
      return;
    }

    const freight = Number(proposedFreightInr);
    if (!Number.isFinite(freight) || freight < 1000) {
      res.status(400).json({ ok: false, message: 'Enter a valid proposed freight amount in INR.' });
      return;
    }

    const offer: TransporterOffer = {
      id: `ofr_${crypto.randomBytes(5).toString('hex')}`,
      loadId: load.id,
      originCity: load.originCity,
      originState: load.originState,
      destinationCity: load.destinationCity,
      destinationState: load.destinationState,
      cargoType: load.cargoType,
      proposedFreightInr: Math.round(freight),
      vehicleReg: vehicle.registrationNumber,
      notes: notes?.trim() || undefined,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    };

    workspace.offers.unshift(offer);
    workspace.notifications.unshift({
      id: `ntf_${crypto.randomBytes(4).toString('hex')}`,
      title: 'Freight Offer Submitted',
      message: `Offer of ₹ ${new Intl.NumberFormat('en-IN').format(offer.proposedFreightInr)} submitted for ${load.originCity} → ${load.destinationCity}.`,
      category: 'load',
      read: false,
      createdAt: new Date().toISOString(),
      targetPath: '/transporter/offers',
    });
    await saveWorkspaceRecord(workspace);

    res.status(201).json({ ok: true, offer });
  });

  app.get('/api/transporter/offers', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    res.json({ ok: true, offers: workspace.offers });
  });

  // 15. Trips, Earnings, Notifications, Documents & Profile
  app.get('/api/transporter/trips', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    res.json({ ok: true, trips: workspace.trips });
  });

  app.post('/api/transporter/trips', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    const { action, tripId } = req.body as { action?: string; tripId?: string };
    const trip = workspace.trips.find((t) => t.id === tripId);
    if (!trip || action !== 'complete') {
      res.status(400).json({ ok: false, message: 'Invalid trip completion request.' });
      return;
    }
    trip.status = 'Completed';
    trip.completedAt = new Date().toISOString();
    const linkedVehicle = workspace.vehicles.find((v) => v.id === trip.vehicleId);
    if (linkedVehicle) {
      linkedVehicle.availabilityStatus = 'Available';
      linkedVehicle.currentCity = trip.destinationCity;
      linkedVehicle.currentRoute = undefined;
    }
    await saveWorkspaceRecord(workspace);
    res.json({ ok: true, trip });
  });

  app.get('/api/transporter/earnings', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    const completed = workspace.trips.filter((t) => t.status === 'Completed');
    const monthlyEarningsInr = completed.reduce((acc, t) => acc + t.freightInr, 0);
    res.json({
      ok: true,
      monthlyEarningsInr,
      totalCompletedTrips: completed.length,
      payouts: completed.map((t) => ({
        tripId: t.id,
        routeLabel: `${t.originCity}, ${t.originState} → ${t.destinationCity}, ${t.destinationState}`,
        vehicleReg: t.vehicleReg,
        freightInr: t.freightInr,
        completedAt: t.completedAt ?? t.startedAt,
      })),
    });
  });

  app.get('/api/transporter/notifications', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    res.json({
      ok: true,
      notifications: workspace.notifications,
      unreadCount: workspace.notifications.filter((n) => !n.read).length,
    });
  });

  app.post('/api/transporter/notifications/read', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    const { notificationId } = req.body as { notificationId?: string };
    for (const item of workspace.notifications) {
      if (!notificationId || notificationId === 'all' || item.id === notificationId) {
        item.read = true;
      }
    }
    await saveWorkspaceRecord(workspace);
    res.json({
      ok: true,
      unreadCount: workspace.notifications.filter((n) => !n.read).length,
    });
  });

  app.get('/api/transporter/documents', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    res.json({ ok: true, documents: workspace.documents });
  });

  app.put('/api/transporter/profile', async (req, res) => {
    const workspace = await requireApprovedTransporter(req, res);
    if (!workspace) return;
    const { displayName, companyName, city, state, email } = req.body as {
      displayName?: string;
      companyName?: string;
      city?: string;
      state?: string;
      email?: string;
    };

    if (!displayName || displayName.trim().length < 2) {
      res.status(400).json({ ok: false, message: 'Display name must be at least 2 characters.' });
      return;
    }

    workspace.profile.displayName = displayName.trim();
    workspace.profile.companyName = companyName?.trim() || undefined;
    workspace.profile.city = city?.trim() || workspace.profile.city;
    workspace.profile.state = state?.trim() || workspace.profile.state;
    workspace.profile.email = email?.trim() || workspace.profile.email;

    await saveWorkspaceRecord(workspace);
    res.json({ ok: true, profile: workspace.profile });
  });

  // 16. Protected Shipper Demo Dashboard & isolated sample mutations
  app.get('/api/shipper/dashboard', async (req, res) => {
    const auth = await requireApprovedShipper(req, res);
    if (!auth) return;

    if (auth.isDemo) {
      const overview = await ensureDemoShipperWorkspace();
      res.json({ ok: true, overview });
      return;
    }

    res.json({
      ok: true,
      overview: {
        profile: auth.profile,
        businessProfile: {
          businessName: auth.profile.companyName ?? auth.profile.displayName,
          accountType: auth.profile.accountTypeLabel ?? 'Registered Business',
          verificationStatus: auth.profile.verificationStatus,
          primaryHub: [auth.profile.city, auth.profile.state].filter(Boolean).join(', ') || 'Chennai, Tamil Nadu',
          corridors: ['Chennai ↔ Bengaluru'],
          typicalGoods: 'General Freight',
        },
        shipments: [],
        transporters: [],
        offers: [],
        bookings: [],
      } satisfies ShipperDashboardOverview,
    });
  });

  app.post('/api/shipper/shipments', async (req, res) => {
    const auth = await requireApprovedShipper(req, res);
    if (!auth) return;
    if (!auth.isDemo) {
      res.status(501).json({ ok: false, message: 'Live shipment creation is not connected yet.' });
      return;
    }

    const { originCity, destinationCity, cargoType, weightTonnes, requiredVehicleSpec, estimatedBudgetInr } =
      req.body as Partial<{
        originCity: string;
        destinationCity: string;
        cargoType: string;
        weightTonnes: number;
        requiredVehicleSpec: string;
        estimatedBudgetInr: number;
      }>;

    if (!originCity?.trim() || !destinationCity?.trim() || !cargoType?.trim()) {
      res.status(400).json({ ok: false, message: 'Origin, destination, and cargo type are required.' });
      return;
    }

    const overview = await ensureDemoShipperWorkspace();
    const newShipment: ShipperDemoShipment = {
      id: `DEMO-SHP-${Math.floor(400 + Math.random() * 599)}`,
      originCity: originCity.trim(),
      originState: originCity.trim().toLowerCase() === 'bengaluru' ? 'KA' : 'TN',
      destinationCity: destinationCity.trim(),
      destinationState: destinationCity.trim().toLowerCase() === 'bengaluru' ? 'KA' : 'TN',
      cargoType: `${cargoType.trim()} (Demo)`,
      weightTonnes: Number(weightTonnes) > 0 ? Number(weightTonnes) : 8,
      requiredVehicleSpec: requiredVehicleSpec?.trim() || '17 ft · Closed Body',
      pickupDateLabel: 'Demo · Scheduled Tomorrow',
      status: 'Open for Quotes',
      estimatedBudgetInr: Number(estimatedBudgetInr) >= 1000 ? Math.round(Number(estimatedBudgetInr)) : 65000,
    };

    overview.shipments.unshift(newShipment);
    await writeJsonAtomic(DEMO_SHIPPER_FILE, overview);
    res.status(201).json({ ok: true, shipment: newShipment });
  });

  app.post('/api/shipper/offers/:offerId/accept', async (req, res) => {
    const auth = await requireApprovedShipper(req, res);
    if (!auth) return;
    if (!auth.isDemo) {
      res.status(501).json({ ok: false, message: 'Live booking confirmation is not connected yet.' });
      return;
    }

    const overview = await ensureDemoShipperWorkspace();
    const offer = overview.offers.find((o) => o.id === req.params.offerId);
    if (!offer) {
      res.status(404).json({ ok: false, message: 'Demo offer not found.' });
      return;
    }
    if (offer.status === 'Accepted') {
      res.json({ ok: true, overview });
      return;
    }

    offer.status = 'Accepted';
    const linkedShipment = overview.shipments.find((s) => s.id === offer.shipmentId);
    if (linkedShipment) {
      linkedShipment.status = 'Booked';
    }
    overview.bookings.unshift({
      id: `DEMO-BKG-${Math.floor(910 + Math.random() * 89)}`,
      routeLabel: offer.routeLabel,
      transporterName: offer.transporterName,
      vehicleReg: offer.vehicleReg,
      cargoSummary: linkedShipment
        ? `${linkedShipment.cargoType} · ${linkedShipment.weightTonnes}T`
        : 'Sample Shipment',
      agreedFreightInr: offer.quotedFreightInr,
      status: 'Confirmed',
    });

    await writeJsonAtomic(DEMO_SHIPPER_FILE, overview);
    res.json({ ok: true, overview });
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
