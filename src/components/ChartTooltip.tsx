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
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelPrefix = 'Year ',
}: CustomChartTooltipProps) {
  const { formatCurrency } = useCurrency();
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-xs space-y-1.5">
      <div className="font-display font-semibold text-[#14213D] border-b border-slate-100 pb-1">
        {typeof label === 'number' ? `${labelPrefix}${label}` : label}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: entry.color || '#14213D' }}
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-mono font-semibold text-[#14213D] tabular-nums">
              {formatCurrency(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
