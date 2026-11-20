import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
import { ThreeShowcase } from '../../components/three/ThreeShowcase';
import { useCurrency } from '../../context/CurrencyContext';
import { getCalculatorBySlug } from '../../data/calculatorsMeta';
import { useCurrencySync } from '../../hooks/useCurrencySync';
import { calculateStandardLoan } from '../../lib/calculators';
import { formatPercent } from '../../lib/format';

interface LoanFormValues {
  loanAmount: number;
  annualRate: number;
  loanTermYears: number;
}

const MONETARY_FIELDS: (keyof LoanFormValues)[] = ['loanAmount'];

export function LoanCalculatorPage() {
  const meta = getCalculatorBySlug('loan-calculator')!;
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
  } = useForm<LoanFormValues>({
    defaultValues: {
      loanAmount: scaleUsdAmount(150000, 0),
      annualRate: 6.5,
      loanTermYears: 15,
    },
    mode: 'onChange',
  });

  useCurrencySync(MONETARY_FIELDS, getValues, setValue);

  const values = watch();
  const loanAmount = Number.isFinite(values.loanAmount) ? values.loanAmount : 0;
  const annualRate = Number.isFinite(values.annualRate) ? values.annualRate : 0;
  const loanTermYears = Number.isFinite(values.loanTermYears) ? values.loanTermYears : 1;

  const amountSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 500,
        max: 10000000,
        sliderMax: 1000000,
        step: 1000,
      }),
    [scaleFieldSpec]
  );

  const result = useMemo(
    () =>
      calculateStandardLoan(loanAmount, annualRate, Math.max(1, Math.round(loanTermYears * 12))),
    [loanAmount, annualRate, loanTermYears]
  );

  const chartData = useMemo(
    () => [
      { year: 0, 'Remaining Balance': result.principal, 'Cumulative Interest': 0 },
      ...result.yearlySchedule.map((row) => ({
        year: row.year,
        'Remaining Balance': Math.round(row.remainingBalance),
        'Cumulative Interest': Math.round(row.cumulativeInterest),
      })),
    ],
    [result]
  );

  const copySummaryText = [
    `EasyLoanCalc — Loan Calculator Summary (${currencyInfo.code})`,
    `Loan Amount: ${formatCurrency(result.principal)}`,
    `Annual Rate: ${formatPercent(result.annualRate)}`,
    `Loan Term: ${loanTermYears} years (${result.months} months)`,
    `Monthly Payment: ${formatCurrency(result.monthlyPayment)}`,
    `Total Interest: ${formatCurrency(result.totalInterest)}`,
    `Total Payment: ${formatCurrency(result.totalPayment)}`,
  ].join('\n');

  return (
    <CalculatorLayout
      meta={meta}
      themeConfig={{
        mode: 'dark',
        pageBgClass: 'bg-midnight-mesh text-white',
        cardBgClass: 'bg-[#12142D] border-white/12 text-white',
        accentTextClass: 'text-[#B4F434]',
      }}
      onReset={() =>
        reset({
          loanAmount: scaleUsdAmount(150000, 0),
          annualRate: 6.5,
          loanTermYears: 15,
        })
      }
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
            max={40}
            sliderMax={20}
            step={0.125}
            suffix="% APR"
            minLabel="0%"
            maxLabel="20%"
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
            helperText={`${result.months} monthly payments`}
            theme="dark"
            accentColor="#B4F434"
          />
        </>
      }
      resultsContent={
        <>
          {/* Top-Left Design Inspired Card: 3D Calculator + Lime Monthly Payment Bar */}
          <div className="bg-[#12142D] rounded-2xl border border-white/12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-7 gap-6">
              <div className="md:col-span-6 space-y-4">
                <div className="text-xs font-medium text-slate-400">
                  Monthly Payment ({currencyInfo.code})
                </div>
                <div className="rounded-xl bg-[#B4F434] px-5 py-4 text-[#090A1A] shadow-lg">
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight">
                    <AnimatedNumber value={result.monthlyPayment} format="currency" />
                  </div>
                  <div className="text-xs font-semibold text-[#1A2E05] mt-1">
                    {result.months} installments at {formatPercent(result.annualRate)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                    <div className="text-[11px] text-slate-400">Total Interest</div>
                    <div className="font-mono text-base font-bold text-[#38BDF8] mt-0.5">
                      <AnimatedNumber value={result.totalInterest} format="currency-int" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                    <div className="text-[11px] text-slate-400">Total Payment</div>
                    <div className="font-mono text-base font-bold text-white mt-0.5">
                      <AnimatedNumber value={result.totalPayment} format="currency-int" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6">
                <ThreeShowcase
                  variant="calculator"
                  className="w-full h-56 sm:h-64"
                  accentValue={Math.min(1, annualRate / 20)}
                />
              </div>
            </div>
          </div>

          {/* Trajectory Area Chart */}
          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Loan Balance &amp; Cumulative Interest
                </h3>
                <p className="text-xs text-slate-400">
                  Remaining principal decline vs. interest accumulated by year
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8]" />
                  Balance
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#B4F434]" />
                  Interest Paid
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="darkLoanBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="darkLoanInt" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="Remaining Balance"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#darkLoanBal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Cumulative Interest"
                    stroke="#B4F434"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#darkLoanInt)"
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
