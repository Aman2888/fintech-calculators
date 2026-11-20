interface BentoCardArtProps {
  slug: string;
}

export function BentoCardArt({ slug }: BentoCardArtProps) {
  switch (slug) {
    case 'loan-calculator':
      return (
        <svg viewBox="0 0 220 150" className="w-full h-36 sm:h-44 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="coinGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* Floating coins rise subtly on hover */}
          <g className="transition-transform duration-300 ease-out group-hover:-translate-y-2">
            <ellipse cx="112" cy="40" rx="22" ry="12" fill="url(#coinGold)" />
            <ellipse cx="112" cy="36" rx="22" ry="12" fill="#FACC15" />
            <text x="112" y="40" textAnchor="middle" fill="#78350F" fontSize="12" fontWeight="800">
              $
            </text>
          </g>
          <g className="transition-transform duration-300 delay-75 ease-out group-hover:-translate-y-3 group-hover:translate-x-1">
            <ellipse cx="152" cy="64" rx="18" ry="10" fill="url(#coinGold)" />
            <ellipse cx="152" cy="60" rx="18" ry="10" fill="#FDE047" />
          </g>
          {/* Stylized 3D Palm / Pedestal */}
          <path
            d="M42 122 C65 102, 100 100, 148 108 C162 110, 166 124, 150 130 C112 142, 68 140, 42 122 Z"
            fill="#FDBA74"
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          />
          <path
            d="M42 122 C62 112, 95 110, 134 116 C140 124, 128 134, 96 135 C68 136, 48 130, 42 122 Z"
            fill="#FB923C"
            opacity="0.45"
          />
        </svg>
      );

    case 'loan-payment-calculator':
      return (
        <div className="rounded-xl bg-black/18 border border-white/15 p-3 space-y-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/90 tabular-nums">
            <span>Monthly Split</span>
            <span>$912/mo</span>
          </div>
          <div className="h-2 w-full rounded-full bg-black/25 overflow-hidden">
            <div className="h-full w-3/4 group-hover:w-5/6 transition-all duration-300 rounded-full bg-white" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/75 font-mono">
            <span>Principal 74%</span>
            <span>Interest 26%</span>
          </div>
        </div>
      );

    case 'loan-interest-calculator':
      return (
        <svg viewBox="0 0 180 95" className="w-full h-24 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="cardGauge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>
          <path
            d="M 24 80 A 66 66 0 0 1 156 80"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 24 80 A 66 66 0 0 1 136 32"
            fill="none"
            stroke="url(#cardGauge)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <g
            style={{ transformOrigin: '90px 78px' }}
            className="transition-transform duration-300 ease-out group-hover:rotate-12"
          >
            <circle cx="90" cy="78" r="6" fill="#FFFFFF" />
            <line
              x1="90"
              y1="78"
              x2="128"
              y2="38"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'loan-amortization-calculator':
      return (
        <svg viewBox="0 0 200 95" className="w-full h-24 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="amortFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 10 18 Q 75 26, 120 55 T 190 84 L 190 90 L 10 90 Z"
            fill="url(#amortFill)"
          />
          <path
            d="M 10 18 Q 75 26, 120 55 T 190 84"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="120"
            cy="55"
            r="5"
            fill="#B4F434"
            className="transition-transform duration-300 group-hover:scale-125"
            style={{ transformOrigin: '120px 55px' }}
          />
        </svg>
      );

    case 'auto-loan-calculator':
      return (
        <svg viewBox="0 0 220 96" className="w-full h-24 overflow-visible" aria-hidden="true">
          <ellipse cx="110" cy="82" rx="76" ry="7" fill="rgba(9,10,26,0.22)" />
          <g className="transition-transform duration-300 ease-out group-hover:translate-x-2">
            <path
              d="M28 66 L36 48 Q56 28 96 26 L138 26 Q168 32 188 48 L196 64 Q196 72 182 72 L40 72 Q28 72 28 66 Z"
              fill="#14213D"
            />
            <path d="M72 32 L134 32 L156 47 L62 47 Z" fill="#38BDF8" opacity="0.65" />
            <circle cx="64" cy="70" r="14" fill="#090A1A" />
            <circle cx="64" cy="70" r="7" fill="#E2E8F0" />
            <circle cx="158" cy="70" r="14" fill="#090A1A" />
            <circle cx="158" cy="70" r="7" fill="#E2E8F0" />
          </g>
        </svg>
      );

    case 'heloc-calculator':
      return (
        <svg viewBox="0 0 200 100" className="w-full h-24 overflow-visible" aria-hidden="true">
          <ellipse cx="100" cy="88" rx="64" ry="7" fill="rgba(9,10,26,0.16)" />
          <g className="transition-transform duration-300 ease-out group-hover:-translate-y-1">
            <rect x="52" y="46" width="96" height="40" rx="4" fill="#FFFFFF" />
            <polygon points="40,48 100,14 160,48" fill="#1D4ED8" />
            <rect x="70" y="58" width="22" height="28" rx="2" fill="#0F172A" />
            <rect
              x="108"
              y="56"
              width="24"
              height="18"
              rx="2"
              fill="#38BDF8"
              className="transition-opacity duration-300 group-hover:opacity-100 opacity-80"
            />
          </g>
        </svg>
      );

    case 'compound-interest-calculator':
    default:
      return (
        <svg viewBox="0 0 180 100" className="w-full h-24 overflow-visible" aria-hidden="true">
          <rect x="68" y="64" width="44" height="26" rx="6" fill="#1E293B" />
          <g
            style={{ transformOrigin: '90px 64px' }}
            className="transition-transform duration-300 ease-out group-hover:scale-110"
          >
            <path d="M90 64 Q90 36 90 22" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <path d="M90 46 Q62 40 58 22 Q78 24 90 42 Z" fill="#34D399" />
            <path d="M90 38 Q118 32 122 14 Q102 16 90 34 Z" fill="#10B981" />
          </g>
          <circle
            cx="136"
            cy="54"
            r="10"
            fill="#FBBF24"
            className="transition-transform duration-300 group-hover:-translate-y-2"
          />
        </svg>
      );
  }
}
