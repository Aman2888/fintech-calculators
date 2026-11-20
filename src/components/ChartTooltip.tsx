import { useCurrency } from '../context/CurrencyContext';

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  labelPrefix?: string;
  theme?: 'light' | 'dark';
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelPrefix = 'Year ',
  theme = 'light',
}: CustomChartTooltipProps) {
  const { formatCurrency } = useCurrency();
  if (!active || !payload || payload.length === 0) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`border rounded-xl shadow-lg px-3.5 py-2.5 text-xs space-y-1.5 ${
      isDark ? 'bg-[#12142D] border-white/12 text-white' : 'bg-white border-slate-200 text-[#14213D]'
    }`}>
      <div className={`font-display font-semibold border-b pb-1 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        {typeof label === 'number' ? `${labelPrefix}${label}` : label}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4"
          >
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: entry.color || (isDark ? '#94A3B8' : '#14213D') }}
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-mono font-semibold tabular-nums">
              {formatCurrency(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
