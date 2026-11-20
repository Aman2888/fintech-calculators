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
import { calculateCompoundInterest } from '../../lib/calculators';
import { formatPercent } from '../../lib/format';

interface CompoundFormValues {
  initialInvestment: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
}

const MONETARY_FIELDS: (keyof CompoundFormValues)[] = [
  'initialInvestment',
  'monthlyContribution',
];

export function CompoundInterestCalculatorPage() {
  const meta = getCalculatorBySlug('compound-interest-calculator')!;
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
  } = useForm<CompoundFormValues>({
    defaultValues: {
      initialInvestment: scaleUsdAmount(15000, 0),
      monthlyContribution: scaleUsdAmount(500, 0),
      annualRate: 8.0,
      years: 20,
    },
    mode: 'onChange',
  });

  useCurrencySync(MONETARY_FIELDS, getValues, setValue);

  const values = watch();
  const initialInvestment = Number.isFinite(values.initialInvestment)
    ? values.initialInvestment
    : 0;
  const monthlyContribution = Number.isFinite(values.monthlyContribution)
    ? values.monthlyContribution
    : 0;
  const annualRate = Number.isFinite(values.annualRate) ? values.annualRate : 0;
  const years = Number.isFinite(values.years) ? values.years : 1;

  const initialSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 0,
        max: 5000000,
        sliderMax: 250000,
        step: 500,
      }),
    [scaleFieldSpec]
  );

  const monthlySpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 0,
        max: 100000,
        sliderMax: 5000,
        step: 50,
      }),
    [scaleFieldSpec]
  );

  const result = useMemo(
    () =>
      calculateCompoundInterest(initialInvestment, monthlyContribution, annualRate, years),
    [initialInvestment, monthlyContribution, annualRate, years]
  );

  const chartData = useMemo(
    () =>
      result.yearlySeries.map((pt) => ({
        year: pt.year,
        'Future Portfolio Value': Math.round(pt.totalValue),
        'Total Invested': Math.round(pt.totalInvested),
        'Interest Earned': Math.round(pt.interestEarned),
      })),
    [result]
  );

  const copySummaryText = [
    `EasyLoanCalc — Compound Interest Summary (${currencyInfo.code})`,
    `Initial Investment: ${formatCurrency(result.initialInvestment)}`,
    `Monthly Contribution: ${formatCurrency(result.monthlyContribution)}`,
    `Annual Return Rate: ${formatPercent(result.annualRate)}`,
    `Duration: ${result.years} years`,
    `Projected Future Value: ${formatCurrency(result.futureValue)}`,
    `Total Invested: ${formatCurrency(result.totalInvested)}`,
    `Total Interest Earned: ${formatCurrency(result.totalInterestEarned)}`,
    `Investment Growth: +${formatPercent(result.growthPercent, 1)}`,
  ].join('\n');

  return (
    <CalculatorLayout
      meta={meta}
      themeConfig={{
        mode: 'dark',
        pageBgClass: 'bg-[#0B0E23] text-white',
        cardBgClass: 'bg-[#131633] border-white/12 text-white',
        accentTextClass: 'text-[#10B981]',
      }}
      onReset={() =>
        reset({
          initialInvestment: scaleUsdAmount(15000, 0),
          monthlyContribution: scaleUsdAmount(500, 0),
          annualRate: 8.0,
          years: 20,
        })
      }
      copySummaryText={copySummaryText}
      formContent={
        <>
          <CalculatorField
            name="initialInvestment"
            label="Initial Investment"
            value={initialInvestment}
            register={register}
            setValue={setValue}
            error={errors.initialInvestment}
            min={initialSpec.min}
            max={initialSpec.max}
            sliderMax={initialSpec.sliderMax}
            step={initialSpec.step}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(initialSpec.min)}
            maxLabel={formatCompactCurrency(initialSpec.sliderMax)}
            theme="dark"
            accentColor="#38BDF8"
          />

          <CalculatorField
            name="monthlyContribution"
            label="Monthly Contribution"
            value={monthlyContribution}
            register={register}
            setValue={setValue}
            error={errors.monthlyContribution}
            min={monthlySpec.min}
            max={monthlySpec.max}
            sliderMax={monthlySpec.sliderMax}
            step={monthlySpec.step}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(monthlySpec.min)}
            maxLabel={formatCompactCurrency(monthlySpec.sliderMax)}
            theme="dark"
            accentColor="#10B981"
          />

          <CalculatorField
            name="annualRate"
            label="Expected Annual Return"
            value={annualRate}
            register={register}
            setValue={setValue}
            error={errors.annualRate}
            min={0}
            max={30}
            sliderMax={15}
            step={0.25}
            suffix="% / yr"
            minLabel="0%"
            maxLabel="15%"
            helperText="Compounded monthly"
            theme="dark"
            accentColor="#A855F7"
          />

          <CalculatorField
            name="years"
            label="Investment Duration"
            value={years}
            register={register}
            setValue={setValue}
            error={errors.years}
            min={1}
            max={50}
            sliderMax={40}
            step={1}
            suffix="Years"
            minLabel="1 yr"
            maxLabel="40 yrs"
            theme="dark"
            accentColor="#B4F434"
          />
        </>
      }
      resultsContent={
        <>
          {/* Deep Midnight Emerald Growth Card + 3D Sprout */}
          <div className="bg-[#131633] rounded-2xl border border-white/12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-7 gap-6">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="text-xs font-medium text-[#34D399]">
                    Projected Future Value (Year {result.years} · {currencyInfo.code})
                  </div>
                  <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white mt-1">
                    <AnimatedNumber value={result.futureValue} format="currency" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-slate-400">Total Invested</div>
                    <div className="font-mono text-sm font-bold text-[#38BDF8] mt-0.5">
                      <AnimatedNumber value={result.totalInvested} format="currency-int" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-slate-400">Interest Earned</div>
                    <div className="font-mono text-sm font-bold text-[#10B981] mt-0.5">
                      <AnimatedNumber value={result.totalInterestEarned} format="currency-int" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-slate-400">Growth</div>
                    <div className="font-mono text-sm font-bold text-[#B4F434] mt-0.5">
                      <AnimatedNumber value={result.growthPercent} format="percent-1" prefix="+" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5">
                <ThreeShowcase
                  variant="plant"
                  className="w-full h-56"
                  accentValue={Math.min(1, years / 40)}
                />
              </div>
            </div>
          </div>

          {/* Interactive Compound Growth Area Chart */}
          <div className="bg-[#131633] rounded-2xl border border-white/12 p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Compounding Wealth Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Portfolio value accelerating above total contributions
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                  Future Value
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8]" />
                  Total Invested
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldFuture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cyanInvested" x1="0" y1="0" x2="0" y2="1">
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
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Future Portfolio Value"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#emeraldFuture)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Total Invested"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cyanInvested)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      }
      breakdownContent={
        <div className="bg-[#131633] rounded-2xl border border-white/12 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="font-display text-lg font-bold text-white">
              Year-by-Year Compounding Schedule ({currencyInfo.code})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Annual contributions, interest earned, and ending balance
            </p>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0D1027] border-b border-white/10 text-xs font-semibold text-slate-300">
                <tr>
                  <th className="py-3 px-6">Year</th>
                  <th className="py-3 px-6 text-right">Annual Contributions</th>
                  <th className="py-3 px-6 text-right">Interest Earned (Yr)</th>
                  <th className="py-3 px-6 text-right">Total Invested</th>
                  <th className="py-3 px-6 text-right">Total Portfolio Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {result.yearlySeries.slice(1).map((row) => (
                  <tr key={row.year} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-6 font-medium text-white tabular-nums">
                      Year {row.year}
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-slate-300 tabular-nums">
                      {formatCurrency(row.yearlyContribution)}
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-[#10B981] tabular-nums">
                      +{formatCurrency(row.yearlyInterest)}
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-[#38BDF8] tabular-nums">
                      {formatCurrency(row.totalInvested)}
                    </td>
                    <td className="py-3 px-6 text-right font-mono font-semibold text-white tabular-nums">
                      {formatCurrency(row.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
    />
  );
}
