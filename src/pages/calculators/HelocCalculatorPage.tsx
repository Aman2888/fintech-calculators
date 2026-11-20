import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import {
  CartesianGrid,
  Line,
  LineChart,
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
import { calculateHeloc, type HelocPaymentType } from '../../lib/calculators';
import { formatPercent } from '../../lib/format';

interface HelocFormValues {
  creditBalance: number;
  annualRate: number;
  durationYears: number;
  paymentType: HelocPaymentType;
}

const MONETARY_FIELDS: (keyof HelocFormValues)[] = ['creditBalance'];

export function HelocCalculatorPage() {
  const meta = getCalculatorBySlug('heloc-calculator')!;
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
  } = useForm<HelocFormValues>({
    defaultValues: {
      creditBalance: scaleUsdAmount(75000, 0),
      annualRate: 8.0,
      durationYears: 10,
      paymentType: 'interest-only',
    },
    mode: 'onChange',
  });

  useCurrencySync(MONETARY_FIELDS, getValues, setValue);

  const values = watch();
  const creditBalance = Number.isFinite(values.creditBalance) ? values.creditBalance : 0;
  const annualRate = Number.isFinite(values.annualRate) ? values.annualRate : 0;
  const durationYears = Number.isFinite(values.durationYears) ? values.durationYears : 1;
  const paymentType = values.paymentType || 'interest-only';

  const balanceSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 1000,
        max: 2000000,
        sliderMax: 500000,
        step: 1000,
      }),
    [scaleFieldSpec]
  );

  const result = useMemo(
    () => calculateHeloc(creditBalance, annualRate, durationYears, paymentType),
    [creditBalance, annualRate, durationYears, paymentType]
  );

  const chartData = useMemo(
    () =>
      result.yearlySeries.map((row) => ({
        year: row.year,
        'Remaining Balance': Math.round(row.selectedBalance),
        'Selected Cumulative Paid': Math.round(row.selectedCumulativePaid),
        'Alternative Cumulative Paid': Math.round(row.alternativeCumulativePaid),
      })),
    [result]
  );

  const copySummaryText = [
    `CALCULATE — HELOC Calculator Summary (${currencyInfo.code})`,
    `Credit Line Balance: ${formatCurrency(result.creditBalance)}`,
    `Annual Rate: ${formatPercent(result.annualRate)}`,
    `Duration: ${result.durationYears} years`,
    `Payment Type: ${
      paymentType === 'interest-only' ? 'Interest Only' : 'Full Principal + Interest'
    }`,
    `Monthly Payment: ${formatCurrency(result.monthlyPayment)}`,
    `Total Interest: ${formatCurrency(result.totalInterest)}`,
    `Total Repayment: ${formatCurrency(result.totalRepayment)}`,
  ].join('\n');

  return (
    <CalculatorLayout
      meta={meta}
      themeConfig={{
        mode: 'light',
        pageBgClass: 'bg-[#F4F7FA] text-[#14213D]',
        cardBgClass: 'bg-white border-slate-200 text-[#14213D] shadow-xs',
        accentTextClass: 'text-[#0D9488]',
      }}
      onReset={() =>
        reset({
          creditBalance: scaleUsdAmount(75000, 0),
          annualRate: 8.0,
          durationYears: 10,
          paymentType: 'interest-only',
        })
      }
      copySummaryText={copySummaryText}
      formContent={
        <>
          <CalculatorField
            name="creditBalance"
            label="Credit Line Balance"
            value={creditBalance}
            register={register}
            setValue={setValue}
            error={errors.creditBalance}
            min={balanceSpec.min}
            max={balanceSpec.max}
            sliderMax={balanceSpec.sliderMax}
            step={balanceSpec.step}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(balanceSpec.min)}
            maxLabel={formatCompactCurrency(balanceSpec.sliderMax)}
            theme="light"
            accentColor="#14B8A6"
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
            sliderMax={18}
            step={0.125}
            suffix="% APR"
            minLabel="0%"
            maxLabel="18%"
            theme="light"
            accentColor="#14B8A6"
          />

          <CalculatorField
            name="durationYears"
            label="Loan / Draw Duration"
            value={durationYears}
            register={register}
            setValue={setValue}
            error={errors.durationYears}
            min={1}
            max={30}
            sliderMax={20}
            step={1}
            suffix="Years"
            minLabel="1 yr"
            maxLabel="20 yrs"
            theme="light"
            accentColor="#2563EB"
          />

          <div className="space-y-2.5 pt-1">
            <label className="block text-sm font-medium text-[#14213D]">
              Payment Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('paymentType', 'interest-only')}
                className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentType === 'interest-only'
                    ? 'border-[#14B8A6] bg-[#14B8A6]/12 text-[#0F766E] shadow-xs'
                    : 'border-slate-200 bg-white text-[#14213D] hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold">Interest Only</div>
                <div className="text-xs opacity-75 mt-0.5">Draw period minimum</div>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('paymentType', 'principal-and-interest')}
                className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentType === 'principal-and-interest'
                    ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#1D4ED8] shadow-xs'
                    : 'border-slate-200 bg-white text-[#14213D] hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold">Full Principal + Interest</div>
                <div className="text-xs opacity-75 mt-0.5">Amortizing payoff</div>
              </motion.button>
            </div>
          </div>
        </>
      }
      resultsContent={
        <>
          {/* Bottom-Right Light Airy Panel: 3D House + Soft Mint Payment Mode Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-7 gap-6">
              <div className="md:col-span-6 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-[#0D9488]">
                    {paymentType === 'interest-only'
                      ? `Interest-Only Monthly Payment (${currencyInfo.code})`
                      : `Full P&I Monthly Payment (${currencyInfo.code})`}
                  </div>
                  <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#14213D] mt-1">
                    <AnimatedNumber value={result.monthlyPayment} format="currency" />
                  </div>
                </div>

                <div className="rounded-xl bg-[#CCFBF1] px-4 py-3 text-[#115E59] flex items-center justify-between">
                  <span className="text-xs font-bold">Total Repayment</span>
                  <span className="font-mono text-base font-extrabold">
                    <AnimatedNumber value={result.totalRepayment} format="currency-int" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-slate-500">Total Interest</div>
                    <div className="font-mono text-sm font-bold text-[#2563EB] mt-0.5">
                      <AnimatedNumber value={result.totalInterest} format="currency-int" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-slate-500">Ending Balance</div>
                    <div className="font-mono text-sm font-bold text-[#14213D] mt-0.5">
                      <AnimatedNumber value={result.remainingBalanceAtTermEnd} format="currency-int" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6">
                <ThreeShowcase
                  variant="house"
                  className="w-full h-56 sm:h-64"
                  accentValue={paymentType === 'interest-only' ? 0.25 : 0.85}
                />
              </div>
            </div>
          </div>

          {/* HELOC Cumulative Comparison Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-[#14213D]">
                  HELOC Balance &amp; Outflow Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Compare selected payment mode against alternative repayment structure
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#14B8A6]" />
                  Balance
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
                  Selected Paid
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-400" />
                  Alternative
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={(v) => `Yr ${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={(v) => formatCompactCurrency(Number(v))}
                    axisLine={false}
                    tickLine={false}
                    width={68}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Remaining Balance"
                    stroke="#14B8A6"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Selected Cumulative Paid"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Alternative Cumulative Paid"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      }
    />
  );
}
