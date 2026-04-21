/**
 * Lightweight inline illustration — evokes lakeside community (Port Credit / GTA)
 * without stock photos or third-party image domains.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      role="img"
      aria-label="Stylized skyline and waterfront community"
      className={className}
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e8f3f1" />
          <stop offset="100%" stopColor="#fafaf7" />
        </linearGradient>
        <linearGradient id="water" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2f8f83" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a2540" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#sky)" />
      <path
        d="M0 290 C120 250 200 310 320 275 S520 230 640 265 L640 420 L0 420 Z"
        fill="url(#water)"
      />
      <g fill="#0a2540" opacity="0.9">
        <rect x="80" y="140" width="46" height="120" rx="4" />
        <rect x="140" y="110" width="56" height="150" rx="4" />
        <rect x="210" y="160" width="40" height="100" rx="4" />
        <rect x="270" y="120" width="70" height="140" rx="4" />
        <rect x="360" y="150" width="52" height="110" rx="4" />
        <rect x="430" y="100" width="64" height="160" rx="4" />
        <rect x="510" y="130" width="48" height="130" rx="4" />
      </g>
      <circle cx="520" cy="70" r="36" fill="#d4af37" opacity="0.55" />
      <path
        d="M120 300 C180 260 260 320 340 285 S480 250 560 275"
        stroke="#d4af37"
        strokeWidth="3"
        fill="none"
        opacity="0.55"
        strokeLinecap="round"
      />
    </svg>
  );
}
