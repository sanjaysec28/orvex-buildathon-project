import { FlaskConical, LogOut } from 'lucide-react';

export interface DemoModeBannerProps {
  roleLabel: 'Transporter' | 'Shipper';
  accountName: string;
  accountType?: string;
  onExitDemo?: () => void;
}

export function DemoModeBanner({
  roleLabel,
  accountName,
  accountType,
  onExitDemo,
}: DemoModeBannerProps) {
  return (
    <div
      role="status"
      aria-label="Demo mode indicator"
      className="rounded-2xl border border-[#BFE2F5] bg-[#EAF6FE] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#18364B]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#18364B] text-[#C8F542] text-[11px] font-extrabold tracking-wide shrink-0">
          <FlaskConical className="w-3 h-3" aria-hidden="true" />
          <span>DEMO MODE</span>
        </span>
        <p className="font-medium text-[#355368] truncate">
          <span className="font-bold text-[#18364B]">{accountName}</span>
          {accountType ? ` · ${accountType}` : ''} · Demo Verified {roleLabel} (Sample data only)
        </p>
      </div>

      {onExitDemo ? (
        <button
          type="button"
          onClick={onExitDemo}
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#1570EF] hover:underline cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Exit Demo</span>
        </button>
      ) : null}
    </div>
  );
}
