import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

interface LoanPaymentFormValues {
  loanAmount: number;
  annualRate: number;
  duration: number;
}

const MONETARY_FIELDS: (keyof LoanPaymentFormValues)[] = ['loanAmount'];

export function LoanPaymentCalculatorPage() {
  const meta = getCalculatorBySlug('loan-payment-calculator')!;
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
  } = useForm<LoanPaymentFormValues>({
    defaultValues: {
      loanAmount: scaleUsdAmount(45000, 0),
      annualRate: 7.25,
      duration: 5,
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
        step: 500,
      }),
    [scaleFieldSpec]
  );

  const result = useMemo(
    () => calculateStandardLoan(loanAmount, annualRate, totalMonths),
    [loanAmount, annualRate, totalMonths]
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

  const curveData = useMemo(
    () =>
      result.yearlySchedule.map((row) => ({
        year: row.year,
        'Remaining Balance': Math.round(row.remainingBalance),
        'Principal Paid': Math.round(row.principalPaid),
        'Interest Paid': Math.round(row.interestPaid),
      })),
    [result]
  );

  const copySummaryText = [
    `EasyLoanCalc — Loan Payment Calculator Summary (${currencyInfo.code})`,
    `Loan Amount: ${formatCurrency(result.principal)}`,
    `Annual Rate: ${formatPercent(result.annualRate)}`,
    `Duration: ${result.months} months`,
    `Monthly Payment: ${formatCurrency(result.monthlyPayment)}`,
    `Principal Share: ${result.principalSharePercent.toFixed(1)}% | Interest Share: ${result.interestSharePercent.toFixed(1)}%`,
    `Total Repayment: ${formatCurrency(result.totalPayment)}`,
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
          loanAmount: scaleUsdAmount(45000, 0),
          annualRate: 7.25,
          duration: 5,
        });
      }}
      copySummaryText={copySummaryText}
      heroVisual={
        /* Repayment schedule */
        <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="text-xs font-semibold text-[#38BDF8]">
                Repayment Schedule Curve · {currencyInfo.flag} {currencyInfo.code}
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Monthly Payment:{' '}
                <AnimatedNumber
                  value={result.monthlyPayment}
                  format="currency"
                  className="font-mono text-[#38BDF8]"
                />
              </h2>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <div className="text-xs text-slate-400">Total Repayment</div>
                <div className="font-mono font-bold text-white">
                  <AnimatedNumber value={result.totalPayment} format="currency" />
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Interest</div>
                <div className="font-mono font-bold text-[#38BDF8]">
                  <AnimatedNumber value={result.totalInterest} format="currency" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={curveData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="loanPaymentBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
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
                <Tooltip content={<ChartTooltip theme="dark" />} />
                <Area
                  type="monotone"
                  dataKey="Remaining Balance"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#loanPaymentBalanceGradient)"
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
            sliderMax={24}
            step={0.125}
            suffix="% APR"
            minLabel="0%"
            maxLabel="24%"
            theme="dark"
            accentColor="#38BDF8"
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
              helperText={`${result.months} installments`}
              theme="dark"
              accentColor="#38BDF8"
            />
          </div>
        </>
      }
      resultsContent={
        <>
          {/* Principal-Interest Breakdown Card + Semi-Circular Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 bg-[#12142D] rounded-2xl border border-white/12 p-6 flex flex-col items-center justify-center">
              <div className="text-xs font-semibold text-slate-400 mb-3 self-start">
                Principal-Interest Breakdown
              </div>
              <InterestGauge
                percentage={result.principalSharePercent}
                label="Principal Share"
                sublabel={`${result.interestSharePercent.toFixed(1)}% goes to interest`}
                theme="dark"
              />
            </div>

            <div className="md:col-span-6 bg-[#12142D] rounded-2xl border border-white/12 p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-400">First Payment Split</div>
                <div className="font-mono text-2xl font-bold text-white mt-1">
                  <AnimatedNumber value={result.monthlyPayment} format="currency" suffix=" / mo" />
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-slate-300">Month 1 Principal</span>
                  <span className="font-mono font-semibold text-[#34D399]">
                    <AnimatedNumber value={result.firstMonthPrincipal} format="currency" />
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-slate-300">Month 1 Interest</span>
                  <span className="font-mono font-semibold text-[#38BDF8]">
                    <AnimatedNumber value={result.firstMonthInterest} format="currency" />
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-white">Total Repayment</span>
                  <span className="font-mono font-bold text-white">
                    <AnimatedNumber value={result.totalPayment} format="currency" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Stacked Principal vs Interest Bar Chart */}
          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Annual Principal vs. Interest Paid
              </h3>
              <p className="text-xs text-slate-400">
                Principal portion grows each year as outstanding debt shrinks
              </p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={curveData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(v) => `Y${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(v) => formatCompactCurrency(Number(v))}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip content={<ChartTooltip theme="dark" />} />
                  <Bar dataKey="Principal Paid" stackId="a" fill="#38BDF8" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Interest Paid" stackId="a" fill="#34D399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      }
    />
  );
}
