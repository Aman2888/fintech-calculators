import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalculatorField } from '../../components/CalculatorField';
import { CalculatorLayout } from '../../components/CalculatorLayout';
import { ChartTooltip } from '../../components/ChartTooltip';
import { AnimatedNumber } from '../../components/motion/AnimatedNumber';
import { InterestGauge } from '../../components/visuals/InterestGauge';
import { useCurrency } from '../../context/CurrencyContext';
import { getCalculatorBySlug } from '../../data/calculatorsMeta';
import { useCurrencySync } from '../../hooks/useCurrencySync';
import { calculateStandardLoan } from '../../lib/calculators';
import { formatPercent } from '../../lib/format';

interface LoanInterestFormValues {
  loanAmount: number;
  annualRate: number;
  duration: number;
}

const MONETARY_FIELDS: (keyof LoanInterestFormValues)[] = ['loanAmount'];

export function LoanInterestCalculatorPage() {
  const meta = getCalculatorBySlug('loan-interest-calculator')!;
  const [unit, setUnit] = useState<'years' | 'months'>('years');
  const {
    currencyInfo,
    scaleUsdAmount,
    scaleFieldSpec,
    formatCurrency,
    formatCompactCurrency,
  } = useCurrency();

  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanInterestFormValues>({
    defaultValues: {
      loanAmount: scaleUsdAmount(80000, 0),
      annualRate: 8.5,
      duration: 10,
    },
    mode: 'onChange',
  });

  useCurrencySync(MONETARY_FIELDS, getValues, setValue);

  const values = watch();
  const loanAmount = Number.isFinite(values.loanAmount) ? values.loanAmount : 0;
  const annualRate = Number.isFinite(values.annualRate) ? values.annualRate : 0;
  const duration = Number.isFinite(values.duration) ? values.duration : 1;
  const totalMonths =
    unit === 'years' ? Math.max(1, Math.round(duration * 12)) : Math.max(1, Math.round(duration));

  const amountSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 500,
        max: 5000000,
        sliderMax: 500000,
        step: 1000,
      }),
    [scaleFieldSpec]
  );

  const result = useMemo(
    () => calculateStandardLoan(loanAmount, annualRate, totalMonths),
    [loanAmount, annualRate, totalMonths]
  );

  const interestToPrincipalRatio =
    result.principal > 0 ? (result.totalInterest / result.principal) * 100 : 0;

  const chartData = useMemo(
    () => [
      { year: 0, 'Cumulative Interest': 0, 'Cumulative Principal': 0 },
      ...result.yearlySchedule.map((row) => ({
        year: row.year,
        'Cumulative Interest': Math.round(row.cumulativeInterest),
        'Cumulative Principal': Math.round(row.cumulativePrincipal),
      })),
    ],
    [result]
  );

  const handleUnitSwitch = (nextUnit: 'years' | 'months') => {
    if (nextUnit === unit) return;
    if (nextUnit === 'months') {
      setValue('duration', Math.max(1, Math.round(duration * 12)), { shouldValidate: true });
    } else {
      setValue('duration', Math.max(1, Math.round(duration / 12)), {
        shouldValidate: true,
      });
    }
    setUnit(nextUnit);
  };

  const copySummaryText = [
    `EasyLoanCalc — Loan Interest Calculator Summary (${currencyInfo.code})`,
    `Loan Amount: ${formatCurrency(result.principal)}`,
    `Annual Rate: ${formatPercent(result.annualRate)}`,
    `Duration: ${result.months} months`,
    `Total Interest: ${formatCurrency(result.totalInterest)}`,
    `Total Amount Paid: ${formatCurrency(result.totalPayment)}`,
    `Interest Percentage of Total Paid: ${formatPercent(result.interestSharePercent)}`,
  ].join('\n');

  return (
    <CalculatorLayout
      meta={meta}
      themeConfig={{
        mode: 'dark',
        pageBgClass: 'bg-midnight-mesh text-white',
        cardBgClass: 'bg-[#12142D] border-white/12 text-white',
        accentTextClass: 'text-[#38BDF8]',
      }}
      onReset={() => {
        setUnit('years');
        reset({
          loanAmount: scaleUsdAmount(80000, 0),
          annualRate: 8.5,
          duration: 10,
        });
      }}
      copySummaryText={copySummaryText}
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
            accentColor="#38BDF8"
          />

          <CalculatorField
            name="annualRate"
            label="Annual Interest Rate"
            value={annualRate}
            register={register}
            setValue={setValue}
            error={errors.annualRate}
            min={0}
            max={40}
            sliderMax={25}
            step={0.125}
            suffix="% APR"
            minLabel="0%"
            maxLabel="25%"
            theme="dark"
            accentColor="#A855F7"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Duration Unit</span>
              <div className="inline-flex p-0.5 bg-white/5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => handleUnitSwitch('years')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    unit === 'years'
                      ? 'bg-[#38BDF8] text-[#090A1A]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Years
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitSwitch('months')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    unit === 'months'
                      ? 'bg-[#38BDF8] text-[#090A1A]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Months
                </button>
              </div>
            </div>

            <CalculatorField
              name="duration"
              label={unit === 'years' ? 'Loan Duration (Years)' : 'Loan Duration (Months)'}
              value={duration}
              register={register}
              setValue={setValue}
              error={errors.duration}
              min={1}
              max={unit === 'years' ? 40 : 480}
              sliderMax={unit === 'years' ? 30 : 120}
              step={1}
              suffix={unit === 'years' ? 'Yrs' : 'Mos'}
              minLabel={unit === 'years' ? '1 yr' : '1 mo'}
              maxLabel={unit === 'years' ? '30 yrs' : '120 mos'}
              helperText={`${result.months} monthly installments`}
              theme="dark"
              accentColor="#10B981"
            />
          </div>
        </>
      }
      resultsContent={
        <>
          {/* Bottom-Left Mockup Panel: 3 Glowing % Orbs + Multi-Stop Interest Meter Gauge */}
          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Three Floating % Orbs */}
              <div className="md:col-span-5 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center justify-center gap-4">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366F1]/35 to-[#3B28CC]/20 border border-indigo-400/50 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                  >
                    <span className="font-mono text-lg font-bold text-white tabular-nums">
                      {result.annualRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-indigo-200">APR</span>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981]/35 to-emerald-900/20 border border-emerald-400/50 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.3)]"
                  >
                    <span className="font-mono text-lg font-bold text-white tabular-nums">
                      {result.interestSharePercent.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-emerald-200">Share</span>
                  </motion.div>
                </div>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#38BDF8]/30 to-cyan-900/20 border border-cyan-400/50 flex flex-col items-center justify-center shadow-[0_0_28px_rgba(56,189,248,0.28)]"
                >
                  <span className="font-mono text-xl font-bold text-white tabular-nums">
                    {interestToPrincipalRatio.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-cyan-200">Int / Prin</span>
                </motion.div>
              </div>

              {/* Interest Meter Gauge */}
              <div className="md:col-span-7 flex flex-col items-center justify-center bg-black/25 rounded-2xl border border-white/10 p-5">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Interest Meter
                </div>
                <InterestGauge
                  percentage={result.interestSharePercent}
                  label="Interest % of Total"
                  sublabel={`Total Paid: ${formatCurrency(result.totalPayment)}`}
                  theme="dark"
                />
              </div>
            </div>

            {/* Highlighted Total Interest Bar */}
            <div className="rounded-xl bg-gradient-to-r from-[#3B28CC] via-[#6366F1] to-[#10B981] p-[1px]">
              <div className="rounded-[11px] bg-[#0B0C1E] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">
                    Total Interest Cost ({currencyInfo.code})
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
                    <AnimatedNumber value={result.totalInterest} format="currency" />
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs text-slate-400">Total Amount Paid</div>
                  <div className="font-mono text-xl font-bold text-[#38BDF8] mt-0.5">
                    <AnimatedNumber value={result.totalPayment} format="currency" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cumulative Curve */}
          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 sm:p-7 space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Cumulative Interest vs. Principal Repaid
              </h3>
              <p className="text-xs text-slate-400">
                Compare total borrowing charges against principal over time
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonInt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="neonPrin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                    dataKey="Cumulative Principal"
                    stroke="#10B981"
                    strokeWidth={2.3}
                    fillOpacity={1}
                    fill="url(#neonPrin)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Cumulative Interest"
                    stroke="#A855F7"
                    strokeWidth={2.3}
                    fillOpacity={1}
                    fill="url(#neonInt)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      }
    />
  );
}
