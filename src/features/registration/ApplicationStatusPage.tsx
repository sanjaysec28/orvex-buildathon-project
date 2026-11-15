import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  FileText,
  Loader2,
  Lock,
  ShieldAlert,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  clearLocalDraft,
  fetchSubmittedApplication,
  loadLocalSubmittedSummary,
} from '../../services/registration/transporterRegistrationService';
import { RegistrationShell } from './components/RegistrationShell';
import type {
  SubmittedTransporterApplicationSummary,
  VerificationStatus,
} from './registrationTypes';

const LIFECYCLE_STATES: ReadonlyArray<{
  status: VerificationStatus;
  description: string;
}> = [
  {
    status: 'Draft',
    description: 'Registration details saved prior to final submission.',
  },
  {
    status: 'Under Verification',
    description: 'Automated checks passed; waiting for ORVEX compliance review.',
  },
  {
    status: 'Action Required',
    description: 'Additional document clarification requested by verification team.',
  },
  {
    status: 'Verified',
    description: 'Transporter approved to add vehicles and accept freight loads.',
  },
  {
    status: 'Rejected',
    description: 'Application did not pass compliance verification requirements.',
  },
];

function statusBadgeStyle(status: VerificationStatus): string {
  switch (status) {
    case 'Verified':
      return 'bg-[#E9F9EE] text-[#18864B] border-[#B7E8CA]';
    case 'Action Required':
      return 'bg-[#FFF3E0] text-[#B45309] border-[#FCD38D]';
    case 'Rejected':
      return 'bg-[#FEF3F2] text-[#B42318] border-[#F5B5B5]';
    case 'Draft':
      return 'bg-[#EFF6FA] text-[#3F5B6E] border-[#DCEAF4]';
    case 'Under Verification':
    default:
      return 'bg-[#FFF2C6] text-[#6B4A00] border-[#F4DB88]';
  }
}

function statusIcon(status: VerificationStatus) {
  switch (status) {
    case 'Verified':
      return <CheckCircle2 className="w-4 h-4 text-[#18864B]" aria-hidden="true" />;
    case 'Action Required':
      return <AlertTriangle className="w-4 h-4 text-[#B45309]" aria-hidden="true" />;
    case 'Rejected':
      return <XCircle className="w-4 h-4 text-[#B42318]" aria-hidden="true" />;
    case 'Under Verification':
    default:
      return <Clock className="w-4 h-4 text-[#A46C00]" aria-hidden="true" />;
  }
}

export function ApplicationStatusPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('applicationId');

  const localFallback = loadLocalSubmittedSummary();
  const targetId = queryId ?? localFallback?.applicationId ?? null;

  const [application, setApplication] = useState<SubmittedTransporterApplicationSummary | null>(
    () => (localFallback && (!queryId || localFallback.applicationId === queryId) ? localFallback : null),
  );
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(targetId));
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!targetId) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }
    let active = true;
    setIsLoading(true);
    void fetchSubmittedApplication(targetId).then((fetched) => {
      if (!active) return;
      if (fetched) {
        setApplication(fetched);
        setNotFound(false);
      } else if (!localFallback || localFallback.applicationId !== targetId) {
        setNotFound(true);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [targetId]);

  const handleCopyId = async () => {
    if (!application) return;
    try {
      await navigator.clipboard.writeText(application.applicationId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <RegistrationShell
      heading="Application Status"
      subtitle="Track your ORVEX transporter verification progress"
      onBack={() => navigate('/auth?role=transporter')}
      backAriaLabel="Back to Transporter Login"
    >
      {isLoading && !application ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-[#3F5B6E]">
          <Loader2 className="w-7 h-7 animate-spin text-[#1570EF]" aria-hidden="true" />
          <p className="text-sm font-medium">Loading application record...</p>
        </div>
      ) : notFound || !application ? (
        <div className="flex-1 flex flex-col justify-between gap-5">
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 text-center space-y-3 shadow-[0_3px_12px_-3px_rgba(24,54,75,0.06)]">
            <span className="w-12 h-12 rounded-full bg-[#EEF6FC] text-[#1570EF] mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold text-[#18364B]">No Submitted Application Found</h2>
            <p className="text-[13.5px] text-[#4A6578] leading-relaxed">
              We could not locate a submitted transporter application for this ID. You can start a new transporter registration or return to Login.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                clearLocalDraft();
                navigate('/auth/register?role=transporter');
              }}
              className="w-full h-[50px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-[15px] cursor-pointer"
            >
              Start Transporter Registration
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth?role=transporter')}
              className="w-full h-[48px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            {/* Core Status & ID Card */}
            <section
              aria-label="Application summary"
              className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 shadow-[0_3px_12px_-3px_rgba(24,54,75,0.06)] space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11.5px] font-medium text-[#5A7486]">Application ID</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold shrink-0',
                      statusBadgeStyle(application.verificationStatus),
                    )}
                  >
                    {statusIcon(application.verificationStatus)}
                    <span>{application.verificationStatus}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15.5px] font-bold font-mono text-[#18364B] tracking-tight">
                    {application.applicationId}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    aria-label="Copy Application ID"
                    className="min-h-[32px] px-2 rounded-lg text-[#1570EF] hover:bg-[#EAF5FC] inline-flex items-center gap-1 text-[11.5px] font-semibold cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <hr className="border-[#ECF3F8]" />

              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#5A7486] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-[11px] text-[#5A7486]">Submitted On</p>
                    <p className="font-bold text-[#18364B]">
                      {new Intl.DateTimeFormat('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(application.submittedAt))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {application.transporterType === 'individual' ? (
                    <User className="w-4 h-4 text-[#5A7486] shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <Building2 className="w-4 h-4 text-[#5A7486] shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#5A7486]">Transporter Type</p>
                    <p className="font-bold text-[#18364B] truncate">
                      {application.transporterType === 'individual'
                        ? 'Individual Owner'
                        : 'Transport Company'}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 flex items-start gap-2">
                  <Users className="w-4 h-4 text-[#5A7486] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#5A7486]">Applicant & Drivers</p>
                    <p className="font-semibold text-[#18364B]">
                      {application.applicantName} · PAN {application.maskedPan}
                    </p>
                    <p className="text-[11.5px] text-[#4A6578]">
                      {application.city}, {application.state} · {application.driverCount}{' '}
                      {application.driverCount === 1 ? 'Driver' : 'Drivers'} ({application.primaryDriverName})
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking Access Restriction Notice */}
            {!application.bookingAccessAllowed ? (
              <div
                role="status"
                className="rounded-[18px] border border-[#F4DB88] bg-[#FFF8E1] p-3.5 text-[12.5px] text-[#5F4200] flex items-start gap-2.5"
              >
                <Lock className="w-4 h-4 text-[#A46C00] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[#18364B]">
                    Freight Booking Access Restricted Until Verification
                  </p>
                  <p className="leading-snug">{application.reviewNote}</p>
                </div>
              </div>
            ) : null}

            {/* Pending Auth Provider Notice */}
            {application.accountAuthStatus === 'pending_auth_provider' ? (
              <div className="rounded-[18px] border border-[#DCEAF4] bg-[#EEF7FD] p-3.5 text-[12px] text-[#3F5B6E] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Application saved in local private server storage. SMS OTP verification and account credential provisioning will activate once Firebase Authentication is connected.
                </span>
              </div>
            ) : null}

            {/* Uploaded Private Documents */}
            <section
              aria-label="Uploaded verification documents"
              className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 shadow-[0_2px_10px_-2px_rgba(24,54,75,0.05)] space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#18864B]" aria-hidden="true" />
                <h2 className="text-[13.5px] font-bold text-[#18364B]">
                  Submitted Documents ({application.uploadedDocuments.length})
                </h2>
              </div>

              <div className="space-y-1.5">
                {application.uploadedDocuments.map((doc) => (
                  <div
                    key={doc.slotKey}
                    className="rounded-xl bg-[#F6FBFF] border border-[#E1EFF8] px-3 py-2 flex items-center justify-between gap-2 text-[12px]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#18364B] truncate">{doc.label}</p>
                      <p className="text-[11px] text-[#5A7486] truncate">{doc.fileName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E9F9EE] text-[#18864B] text-[11px] font-bold shrink-0">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Full 5-State Verification Lifecycle */}
            <section
              aria-label="Verification lifecycle"
              className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 shadow-[0_2px_10px_-2px_rgba(24,54,75,0.05)] space-y-2.5"
            >
              <h2 className="text-[13.5px] font-bold text-[#18364B]">Verification Stages</h2>
              <ol className="space-y-2">
                {LIFECYCLE_STATES.map((item) => {
                  const isCurrent = item.status === application.verificationStatus;
                  return (
                    <li
                      key={item.status}
                      className={cn(
                        'rounded-xl px-3 py-2 border text-[12px] flex items-start gap-2.5',
                        isCurrent
                          ? 'bg-[#FFF9E6] border-[#F4DB88]'
                          : 'bg-[#F9FCFF] border-[#E8F2F8] opacity-80',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1 w-2.5 h-2.5 rounded-full shrink-0',
                          isCurrent ? 'bg-[#D99B00]' : 'bg-[#BDD3E2]',
                        )}
                      />
                      <div>
                        <p className="font-bold text-[#18364B]">
                          {item.status}
                          {isCurrent ? ' (Current)' : ''}
                        </p>
                        <p className="text-[#4A6578] leading-snug">{item.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/auth?role=transporter')}
              className="w-full h-[50px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] font-bold text-[15px] cursor-pointer shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)]"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </RegistrationShell>
  );
}
