import { CheckCircle2, FileText, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchTransporterDocuments } from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { TransporterVaultDocument } from '../transporterDashboardTypes';

export function TransporterDocumentsPage() {
  const [documents, setDocuments] = useState<TransporterVaultDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchTransporterDocuments().then((res) => {
      if (!active) return;
      if (res.ok) setDocuments(res.data.documents);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <TransporterDashboardShell pageTitle="Document Centre">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-extrabold text-[#18364B]">Private Document Vault</h2>
            <p className="text-xs sm:text-sm text-[#4A6578]">
              Verification records (PAN, identity, address proof, and driver licences) stored in private server storage.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading document vault...
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-[#5A7486] mx-auto" aria-hidden="true" />
            <p className="text-base font-bold text-[#18364B]">No additional vault documents listed.</p>
            <p className="text-sm text-[#4A6578]">
              Submitted KYC and driver documents remain safely archived with your verification record.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {documents.map((doc) => (
              <article
                key={doc.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#1570EF]">
                    {doc.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#18364B] truncate">{doc.title}</h3>
                  <p className="text-xs text-[#5A7486] truncate">{doc.fileName}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E7F8D8] text-[#286B14] border border-[#C5ECAA] text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{doc.status}</span>
                </span>
              </article>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
