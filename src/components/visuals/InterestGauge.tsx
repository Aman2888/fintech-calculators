interface InterestGaugeProps {
  percentage: number;
  label: string;
  sublabel?: string;
  theme?: 'dark' | 'light';
}

export function InterestGauge({
  percentage,
  label,
  sublabel,
  theme = 'dark',
}: InterestGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(percentage) ? percentage : 0));
  const radius = 84;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Needle angle: -90deg (left) to +90deg (right)
  const angleDeg = -90 + (clamped / 100) * 180;
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const nx = 110 + Math.cos(angleRad) * 62;
  const ny = 108 + Math.sin(angleRad) * 62;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 220 132"
        className="w-full max-w-[260px] overflow-visible"
        role="img"
        aria-label={`${label}: ${clamped.toFixed(1)}%`}
      >
        <defs>
          <linearGradient id={`gaugeGrad-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="45%" stopColor="#B4F434" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d="M 26 108 A 84 84 0 0 1 194 108"
          fill="none"
          stroke={theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Active Value Arc */}
        <path
          d="M 26 108 A 84 84 0 0 1 194 108"
          fill="none"
          stroke={`url(#gaugeGrad-${theme})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 250ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Indicator Marker */}
        <circle
          cx={nx}
          cy={ny}
          r="5"
          fill={theme === 'dark' ? '#FFFFFF' : '#14213D'}
          stroke="#10B981"
          strokeWidth="2.5"
          style={{ transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Center Readout */}
        <text
          x="110"
          y="88"
          textAnchor="middle"
          className="font-mono font-bold tabular-nums"
          fill={theme === 'dark' ? '#FFFFFF' : '#14213D'}
          fontSize="26"
        >
          {clamped.toFixed(1)}%
        </text>
        <text
          x="110"
          y="108"
          textAnchor="middle"
          fill={theme === 'dark' ? '#94A3B8' : '#64748B'}
          fontSize="11"
          fontWeight="500"
        >
          {label}
        </text>
      </svg>
      {sublabel && (
        <div
          className={`text-xs mt-1 text-center ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
