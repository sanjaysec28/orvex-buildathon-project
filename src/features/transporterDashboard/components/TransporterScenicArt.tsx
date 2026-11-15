import { cn } from '../../../utils/cn';

export function WelcomeBannerBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 220"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="orvex-sky-grad" x1="0" y1="0" x2="1000" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E6F4FD" />
            <stop offset="48%" stopColor="#BCE5FC" />
            <stop offset="100%" stopColor="#89CEF7" />
          </linearGradient>
          <linearGradient id="orvex-hill-grad" x1="420" y1="120" x2="980" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9ED9AE" />
            <stop offset="100%" stopColor="#72BD77" />
          </linearGradient>
        </defs>
        <rect width="1000" height="220" fill="url(#orvex-sky-grad)" />
        {/* Soft clouds */}
        <ellipse cx="640" cy="48" rx="95" ry="22" fill="#FFFFFF" fillOpacity="0.65" />
        <ellipse cx="775" cy="36" rx="110" ry="20" fill="#FFFFFF" fillOpacity="0.55" />
        <ellipse cx="905" cy="58" rx="85" ry="18" fill="#FFFFFF" fillOpacity="0.5" />
        {/* Distant hills */}
        <path
          d="M410 175 C490 120, 565 130, 645 110 C735 88, 825 125, 1000 95 L1000 220 L410 220 Z"
          fill="#99CCE8"
          fillOpacity="0.55"
        />
        <path
          d="M475 185 C565 148, 680 140, 810 132 C900 126, 955 135, 1000 128 L1000 220 L475 220 Z"
          fill="url(#orvex-hill-grad)"
          fillOpacity="0.6"
        />
        {/* Highway asphalt strip */}
        <path d="M350 220 L615 162 L1000 162 L1000 220 Z" fill="#8EA2B2" fillOpacity="0.82" />
        <path d="M405 220 L645 162 L660 162 L440 220 Z" fill="#C4D4DF" fillOpacity="0.8" />
        <line
          x1="485"
          y1="198"
          x2="985"
          y2="188"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeDasharray="18 16"
          strokeOpacity="0.72"
        />
        {/* Left light readability wash */}
        <rect x="0" y="0" width="540" height="220" fill="#EFF8FF" fillOpacity="0.74" />
        <linearGradient id="orvex-fade-wash" x1="420" y1="0" x2="620" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EFF8FF" stopOpacity="0.74" />
          <stop offset="100%" stopColor="#EFF8FF" stopOpacity="0" />
        </linearGradient>
        <rect x="420" y="0" width="200" height="220" fill="url(#orvex-fade-wash)" />
      </svg>
    </div>
  );
}

export function ReturnLoadBannerBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 180"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="ret-sky-grad" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8ED0F6" />
            <stop offset="35%" stopColor="#D8EFFC" />
            <stop offset="72%" stopColor="#F5FAFF" />
            <stop offset="100%" stopColor="#EDF9D4" />
          </linearGradient>
        </defs>
        <rect width="1000" height="180" fill="url(#ret-sky-grad)" />
        {/* Mountain ridge left */}
        <path
          d="M0 112 L75 56 L152 94 L220 50 L315 118 L315 180 L0 180 Z"
          fill="#6BA8D9"
          fillOpacity="0.52"
        />
        <path
          d="M0 132 L110 88 L195 112 L340 126 L340 180 L0 180 Z"
          fill="#7AC193"
          fillOpacity="0.5"
        />
        {/* Highway left */}
        <path d="M0 180 L0 136 L340 120 L275 180 Z" fill="#6F8598" fillOpacity="0.86" />
        <line
          x1="28"
          y1="158"
          x2="265"
          y2="134"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeDasharray="16 14"
          strokeOpacity="0.8"
        />
        {/* Right Lime curved wave */}
        <path
          d="M520 180 C650 155, 760 118, 1000 116 L1000 180 Z"
          fill="#C8F542"
          fillOpacity="0.82"
        />
        <path
          d="M665 180 C770 150, 865 135, 1000 142 L1000 180 Z"
          fill="#B6EC2E"
          fillOpacity="0.6"
        />
      </svg>
    </div>
  );
}

export function RoutePinsDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 120"
      className={cn('w-36 h-24 shrink-0 pointer-events-none', className)}
      fill="none"
      aria-hidden="true"
    >
      {/* Dashed curved route */}
      <path
        d="M36 96 C62 84, 72 106, 98 92 C122 80, 122 60, 146 56"
        stroke="#2F7CF6"
        strokeWidth="2.4"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      {/* Origin pin (green) */}
      <path
        d="M36 52 C27 52, 20 59, 20 68 C20 80, 36 94, 36 94 C36 94, 52 80, 52 68 C52 59, 45 52, 36 52 Z"
        fill="#A4E82C"
        stroke="#4D8800"
        strokeWidth="1.5"
      />
      <circle cx="36" cy="68" r="5.5" fill="#FFFFFF" />
      {/* Destination pin (blue) */}
      <path
        d="M146 14 C137 14, 130 21, 130 30 C130 42, 146 56, 146 56 C146 56, 162 42, 162 30 C162 21, 155 14, 146 14 Z"
        fill="#2484F5"
        stroke="#1557B0"
        strokeWidth="1.5"
      />
      <circle cx="146" cy="30" r="5.5" fill="#FFFFFF" />
    </svg>
  );
}

export function OrvexTruckCutout({
  className,
  alt = 'ORVEX freight truck',
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/assets/orvex-transporter-truck.webp"
      alt={alt}
      className={cn(
        'object-contain select-none pointer-events-none [mask-image:radial-gradient(ellipse_88%_84%_at_50%_52%,black_68%,transparent_98%)]',
        className,
      )}
      loading="eager"
    />
  );
}
