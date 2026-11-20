import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { CalculatorField } from '../../components/CalculatorField';
import { CalculatorLayout } from '../../components/CalculatorLayout';
import { ChartTooltip } from '../../components/ChartTooltip';
import { AnimatedNumber } from '../../components/motion/AnimatedNumber';
import { useCurrency } from '../../context/CurrencyContext';
import { getCalculatorBySlug } from '../../data/calculatorsMeta';
import { useCurrencySync } from '../../hooks/useCurrencySync';
import { calculateAmortization } from '../../lib/calculators';
import { formatPercent } from '../../lib/format';

interface AmortizationFormValues {
  loanAmount: number;
  annualRate: number;
  loanTermYears: number;
  extraMonthlyPayment: number;
}

const MONETARY_FIELDS: (keyof AmortizationFormValues)[] = ['loanAmount', 'extraMonthlyPayment'];

export function LoanAmortizationCalculatorPage() {
  const meta = getCalculatorBySlug('loan-amortization-calculator')!;
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const {
    currencyInfo,
    scaleUsdAmount,
    scaleFieldSpec,
    formatCurrency,
    formatCompactCurrency,
  } = useCurrency();

  const hasAmountQuery = searchParams.get('amount') !== null && searchParams.get('amount')?.trim() !== '';

  const parseParam = (key: string, fallback: number) => {
    const raw = searchParams.get(key);
    if (raw === null || raw.trim() === '') return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<AmortizationFormValues>({
    defaultValues: {
      loanAmount: parseParam('amount', scaleUsdAmount(320000, 0)),
      annualRate: parseParam('rate', 6.25),
      loanTermYears: parseParam('years', 30),
      extraMonthlyPayment: scaleUsdAmount(250, 0),
    },
    mode: 'onChange',
  });

  useCurrencySync(MONETARY_FIELDS, getValues, setValue, hasAmountQuery);

  const values = watch();
  const loanAmount = Number.isFinite(values.loanAmount) ? values.loanAmount : 0;
  const annualRate = Number.isFinite(values.annualRate) ? values.annualRate : 0;
  const loanTermYears = Number.isFinite(values.loanTermYears) ? values.loanTermYears : 1;
  const extraMonthlyPayment = Number.isFinite(values.extraMonthlyPayment)
    ? values.extraMonthlyPayment
    : 0;

  const amountSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 1000,
        max: 10000000,
        sliderMax: 1000000,
        step: 5000,
      }),
    [scaleFieldSpec]
  );

  const extraSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 0,
        max: 50000,
        sliderMax: 2500,
        step: 25,
      }),
    [scaleFieldSpec]
  );

  const result = useMemo(
    () => calculateAmortization(loanAmount, annualRate, loanTermYears, extraMonthlyPayment),
    [loanAmount, annualRate, loanTermYears, extraMonthlyPayment]
  );

  const chartData = useMemo(
    () => [
      {
        year: 0,
        'Standard Balance': Math.max(0, Math.round(loanAmount)),
        'With Extra Payment': Math.max(0, Math.round(loanAmount)),
      },
      ...result.yearlyComparison.map((row) => ({
        year: row.year,
        'Standard Balance': Math.round(row.standardBalance),
        'With Extra Payment': Math.round(row.acceleratedBalance),
      })),
    ],
    [result, loanAmount]
  );

  const handleExportCsv = () => {
    const header = [
      'Month',
      'Date',
      `Total Payment (${currencyInfo.code})`,
      `Principal (${currencyInfo.code})`,
      `Interest (${currencyInfo.code})`,
      `Extra Payment (${currencyInfo.code})`,
      `Remaining Balance (${currencyInfo.code})`,
    ];
    const rows = result.schedule.map((r) => [
      r.month,
      `"${r.dateLabel}"`,
      r.payment.toFixed(currencyInfo.decimals),
      r.principal.toFixed(currencyInfo.decimals),
      r.interest.toFixed(currencyInfo.decimals),
      r.extraPayment.toFixed(currencyInfo.decimals),
      r.remainingBalance.toFixed(currencyInfo.decimals),
    ]);
    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculate-amortization-${currencyInfo.code.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copySummaryText = [
    `CALCULATE — Loan Amortization Summary (${currencyInfo.code})`,
    `Loan Amount: ${formatCurrency(loanAmount)}`,
    `Annual Rate: ${formatPercent(annualRate)}`,
    `Total Monthly Payment: ${formatCurrency(result.totalMonthlyPayment)}`,
    `Original Payoff: ${result.originalPayoffDate} | Early Payoff: ${result.acceleratedPayoffDate}`,
    `Total Interest Saved: ${formatCurrency(result.totalInterestSaved)}`,
  ].join('\n');

  return (
    <CalculatorLayout
      meta={meta}
      themeConfig={{
        mode: 'dark',
        pageBgClass: 'bg-[#090B1A] bg-obsidian-grid text-white',
        cardBgClass: 'bg-[#11142B] border-white/12 text-white',
        accentTextClass: 'text-[#B4F434]',
      }}
      onReset={() =>
        reset({
          loanAmount: scaleUsdAmount(320000, 0),
          annualRate: 6.25,
          loanTermYears: 30,
          extraMonthlyPayment: scaleUsdAmount(250, 0),
        })
      }
      copySummaryText={copySummaryText}
      heroVisual={
        /* Top-Right Mockup Panel: Wide Obsidian Analytics Chart with Lime Curve */
        <div className="bg-[#11142B] rounded-2xl border border-white/12 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-xs text-slate-400">
                  Interest Saved ({currencyInfo.code})
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#B4F434]">
                  <AnimatedNumber value={result.totalInterestSaved} format="currency" />
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Early Payoff Date</div>
                <div className="font-mono text-xl font-bold text-white tabular-nums">
                  {result.acceleratedPayoffDate}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Time Saved</div>
                <div className="font-mono text-xl font-bold text-[#38BDF8]">
                  <AnimatedNumber value={result.monthsSaved} format="integer" suffix=" months" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-400" />
                Standard Balance
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#B4F434]" />
                With Extra Payment
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="obsidianLime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B4F434" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#B4F434" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={(v) => `Yr ${v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={(v) => formatCompactCurrency(Number(v))}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Standard Balance"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="With Extra Payment"
                  stroke="#B4F434"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#obsidianLime)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      }
      formContent={
        <>
          <CalculatorField
            name="loanAmount"
            label="Loan Amount"
            value={loanAmount}
            register={register}
            setValue={setValue}
            error={errors.loanAmount}
            min={amountSpec.min}
            max={amountSpec.max}
            sliderMax={amountSpec.sliderMax}
            step={amountSpec.step}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(amountSpec.min)}
            maxLabel={formatCompactCurrency(amountSpec.sliderMax)}
            theme="dark"
            accentColor="#B4F434"
          />

          <CalculatorField
            name="annualRate"
            label="Annual Interest Rate"
            value={annualRate}
            register={register}
            setValue={setValue}
            error={errors.annualRate}
            min={0}
            max={30}
            sliderMax={15}
            step={0.125}
            suffix="% APR"
            minLabel="0%"
            maxLabel="15%"
            theme="dark"
            accentColor="#B4F434"
          />

          <CalculatorField
            name="loanTermYears"
            label="Loan Term"
            value={loanTermYears}
            register={register}
            setValue={setValue}
            error={errors.loanTermYears}
            min={1}
            max={40}
            sliderMax={30}
            step={1}
            suffix="Years"
            minLabel="1 yr"
            maxLabel="30 yrs"
            theme="dark"
            accentColor="#B4F434"
          />

          <CalculatorField
            name="extraMonthlyPayment"
            label="Extra Monthly Payment"
            value={extraMonthlyPayment}
            register={register}
            setValue={setValue}
            error={errors.extraMonthlyPayment}
            min={extraSpec.min}
            max={extraSpec.max}
            sliderMax={extraSpec.sliderMax}
            step={extraSpec.step}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(extraSpec.min)}
            maxLabel={formatCompactCurrency(extraSpec.sliderMax)}
            helperText="Applied directly to principal"
            theme="dark"
            accentColor="#10B981"
          />
        </>
      }
      resultsContent={
        <div className="space-y-6">
          {/* Monthly Principal & Interest Breakdown */}
          <div className="bg-[#11142B] rounded-2xl border border-white/12 p-6 space-y-5">
            <h3 className="font-display text-base font-bold text-white">
              Monthly Principal &amp; Early Payoff Comparison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-slate-400">Monthly Payment (+Extra)</div>
                <div className="font-mono text-2xl font-bold text-[#B4F434] mt-1">
                  <AnimatedNumber value={result.totalMonthlyPayment} format="currency" />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Base: {formatCurrency(result.baseMonthlyPayment)}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-slate-400">Month 1 Principal</div>
                <div className="font-mono text-2xl font-bold text-[#10B981] mt-1">
                  <AnimatedNumber value={result.firstMonthPrincipal} format="currency" />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Month 1 Interest: {formatCurrency(result.firstMonthInterest)}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-slate-400">Remaining Balance</div>
                <div className="font-mono text-2xl font-bold text-white mt-1">
                  <AnimatedNumber
                    value={result.schedule[0]?.remainingBalance ?? 0}
                    format="currency"
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1">After Month 1</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Standard Payoff</span>
                <span className="font-mono text-slate-200 tabular-nums text-right">
                  {result.originalPayoffDate} ({formatCurrency(result.standardTotalInterest, 0)} int.)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Accelerated Payoff</span>
                <span className="font-mono font-semibold text-[#B4F434] tabular-nums text-right">
                  {result.acceleratedPayoffDate} ({formatCurrency(result.acceleratedTotalInterest, 0)}{' '}
                  int.)
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      breakdownContent={
        <div className="bg-[#11142B] rounded-2xl border border-white/12 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Interactive Amortization Schedule ({currencyInfo.code})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {viewMode === 'annual' ? 'Annual' : 'Monthly'} principal, interest, and remaining
                balance progression
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 no-print">
              <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('annual')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'annual'
                      ? 'bg-[#B4F434] text-[#090A1A]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Annual Summary
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('monthly')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'monthly'
                      ? 'bg-[#B4F434] text-[#090A1A]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Monthly ({result.schedule.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={result.schedule.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#B4F434]" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            {viewMode === 'annual' ? (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0B0D1F] border-b border-white/10 text-xs font-semibold text-slate-300">
                  <tr>
                    <th className="py-3 px-6">Year</th>
                    <th className="py-3 px-6 text-right">Principal Paid</th>
                    <th className="py-3 px-6 text-right">Interest Paid</th>
                    <th className="py-3 px-6 text-right">Standard Balance</th>
                    <th className="py-3 px-6 text-right">Accelerated Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {result.yearlyComparison.map((row) => (
                    <tr key={row.year} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 font-medium text-white tabular-nums">
                        Year {row.year}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-[#10B981] tabular-nums">
                        {formatCurrency(row.principalPaid)}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-[#38BDF8] tabular-nums">
                        {formatCurrency(row.interestPaid)}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-slate-400 tabular-nums">
                        {formatCurrency(row.standardBalance)}
                      </td>
                      <td className="py-3 px-6 text-right font-mono font-semibold text-[#B4F434] tabular-nums">
                        {formatCurrency(row.acceleratedBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0B0D1F] border-b border-white/10 text-xs font-semibold text-slate-300">
                  <tr>
                    <th className="py-3 px-5">Mo</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5 text-right">Payment</th>
                    <th className="py-3 px-5 text-right">Principal</th>
                    <th className="py-3 px-5 text-right">Interest</th>
                    <th className="py-3 px-5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-5 font-mono text-xs text-slate-400 tabular-nums">
                        #{row.month}
                      </td>
                      <td className="py-2.5 px-5 text-slate-200 whitespace-nowrap">
                        {row.dateLabel}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono text-white tabular-nums">
                        {formatCurrency(row.payment)}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono text-[#10B981] tabular-nums">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono text-[#38BDF8] tabular-nums">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono font-semibold text-[#B4F434] tabular-nums">
                        {formatCurrency(row.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      }
    />
  );
}
