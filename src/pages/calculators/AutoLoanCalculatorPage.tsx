import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { calculateAutoLoan } from '../../lib/calculators';
import { formatPercent } from '../../lib/format';

interface AutoLoanFormValues {
  carPrice: number;
  downPayment: number;
  annualRate: number;
  loanTermYears: number;
}

const MONETARY_FIELDS: (keyof AutoLoanFormValues)[] = ['carPrice', 'downPayment'];

export function AutoLoanCalculatorPage() {
  const meta = getCalculatorBySlug('auto-loan-calculator')!;
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
    trigger,
    formState: { errors },
  } = useForm<AutoLoanFormValues>({
    defaultValues: {
      carPrice: scaleUsdAmount(38000, 0),
      downPayment: scaleUsdAmount(6000, 0),
      annualRate: 5.9,
      loanTermYears: 5,
    },
    mode: 'onChange',
  });

  useCurrencySync(MONETARY_FIELDS, getValues, setValue);

  const values = watch();
  const carPrice = Number.isFinite(values.carPrice) ? values.carPrice : 0;
  const downPayment = Number.isFinite(values.downPayment) ? values.downPayment : 0;
  const annualRate = Number.isFinite(values.annualRate) ? values.annualRate : 0;
  const loanTermYears = Number.isFinite(values.loanTermYears) ? values.loanTermYears : 1;

  useEffect(() => {
    trigger('downPayment');
  }, [carPrice, trigger]);

  const priceSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 1000,
        max: 500000,
        sliderMax: 150000,
        step: 500,
      }),
    [scaleFieldSpec]
  );

  const downStep = useMemo(() => {
    const scaled = scaleFieldSpec({
      min: 0,
      max: 500000,
      sliderMax: 150000,
      step: 500,
    });
    return scaled.step;
  }, [scaleFieldSpec]);

  const result = useMemo(
    () => calculateAutoLoan(carPrice, downPayment, annualRate, loanTermYears),
    [carPrice, downPayment, annualRate, loanTermYears]
  );

  const pieData = [
    { name: 'Down Payment', value: Math.round(result.downPayment), color: '#38BDF8' },
    { name: 'Loan Principal', value: Math.round(result.principal), color: '#4ADE80' },
    { name: 'Total Interest', value: Math.round(result.totalInterest), color: '#A855F7' },
  ].filter((item) => item.value > 0);

  const yearlyData = result.yearlySchedule.map((row) => ({
    year: row.year,
    Principal: Math.round(row.principalPaid),
    Interest: Math.round(row.interestPaid),
  }));

  const copySummaryText = [
    `CALCULATE — Auto Loan Summary (${currencyInfo.code})`,
    `Car Price: ${formatCurrency(result.carPrice)}`,
    `Down Payment: ${formatCurrency(result.downPayment)} (${result.downPaymentPercent.toFixed(1)}%)`,
    `Loan Amount Financed: ${formatCurrency(result.principal)}`,
    `Annual Rate: ${formatPercent(result.annualRate)}`,
    `Loan Term: ${loanTermYears} years (${result.months} months)`,
    `Monthly Payment: ${formatCurrency(result.monthlyPayment)}`,
    `Total Interest: ${formatCurrency(result.totalInterest)}`,
    `Total Payment: ${formatCurrency(result.totalPayment)}`,
  ].join('\n');

  const downSliderMax = Math.max(priceSpec.min, carPrice);

  return (
    <CalculatorLayout
      meta={meta}
      themeConfig={{
        mode: 'dark',
        pageBgClass: 'bg-[#070812] text-white',
        cardBgClass: 'bg-[#0F1224] border-white/12 text-white',
        accentTextClass: 'text-[#4ADE80]',
      }}
      onReset={() =>
        reset({
          carPrice: scaleUsdAmount(38000, 0),
          downPayment: scaleUsdAmount(6000, 0),
          annualRate: 5.9,
          loanTermYears: 5,
        })
      }
      copySummaryText={copySummaryText}
      formContent={
        <>
          <CalculatorField
            name="carPrice"
            label="Car Price"
            value={carPrice}
            register={register}
            setValue={setValue}
            error={errors.carPrice}
            min={priceSpec.min}
            max={priceSpec.max}
            sliderMax={priceSpec.sliderMax}
            step={priceSpec.step}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(priceSpec.min)}
            maxLabel={formatCompactCurrency(priceSpec.sliderMax)}
            theme="dark"
            accentColor="#B4F434"
          />

          <CalculatorField
            name="downPayment"
            label="Down Payment"
            value={downPayment}
            register={register}
            setValue={setValue}
            error={errors.downPayment}
            min={0}
            max={carPrice}
            sliderMax={downSliderMax}
            step={downStep}
            prefix={currencyInfo.symbol}
            minLabel={formatCompactCurrency(0)}
            maxLabel={formatCompactCurrency(downSliderMax)}
            helperText={`${result.downPaymentPercent.toFixed(1)}% down`}
            validate={(v) =>
              v <= carPrice || 'Down payment cannot exceed the car price'
            }
            theme="dark"
            accentColor="#4ADE80"
          />

          <CalculatorField
            name="annualRate"
            label="Annual Interest Rate"
            value={annualRate}
            register={register}
            setValue={setValue}
            error={errors.annualRate}
            min={0}
            max={35}
            sliderMax={18}
            step={0.1}
            suffix="% APR"
            minLabel="0%"
            maxLabel="18%"
            theme="dark"
            accentColor="#38BDF8"
          />

          <CalculatorField
            name="loanTermYears"
            label="Loan Term"
            value={loanTermYears}
            register={register}
            setValue={setValue}
            error={errors.loanTermYears}
            min={1}
            max={8}
            sliderMax={8}
            step={1}
            suffix="Years"
            minLabel="1 yr"
            maxLabel="8 yrs"
            helperText={`${result.months} monthly installments`}
            theme="dark"
            accentColor="#4ADE80"
          />
        </>
      }
      resultsContent={
        <>
          {/* Mid-Right Showroom Card: 3D Metallic Car + Mint Financing Bar */}
          <div className="bg-[#0F1224] rounded-2xl border border-white/12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-7 gap-6">
              <div className="md:col-span-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-slate-400">
                    Estimated Monthly Payment ({currencyInfo.code})
                  </div>
                  <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white mt-1">
                    <AnimatedNumber value={result.monthlyPayment} format="currency" />
                  </div>
                </div>

                <div className="rounded-xl bg-[#4ADE80] px-4 py-3 text-[#062814] flex items-center justify-between shadow-lg shadow-[#4ADE80]/10">
                  <span className="text-xs font-bold">Financed Loan Amount</span>
                  <span className="font-mono text-base font-extrabold">
                    <AnimatedNumber value={result.principal} format="currency-int" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-slate-400">Total Interest</div>
                    <div className="font-mono text-sm font-bold text-[#A855F7] mt-0.5">
                      <AnimatedNumber value={result.totalInterest} format="currency-int" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-slate-400">Total Loan Payment</div>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      <AnimatedNumber value={result.totalPayment} format="currency-int" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6">
                <ThreeShowcase
                  variant="car"
                  className="w-full h-56 sm:h-64"
                  accentValue={carPrice > 0 ? Math.min(1, downPayment / carPrice) : 0}
                />
              </div>
            </div>
          </div>

          {/* Car Financing Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-[#0F1224] rounded-2xl border border-white/12 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Car Cost Split
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All-in cost:{' '}
                  <AnimatedNumber
                    value={result.totalVehicleCost}
                    format="currency-int"
                    className="font-mono text-slate-200 font-semibold"
                  />
                </p>
              </div>

              <div className="h-44 w-full my-2">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center">
                    Enter a vehicle price above {formatCurrency(0, 0)} to visualize cost split
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={68}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value ?? 0))}
                        contentStyle={{
                          backgroundColor: '#070812',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span
                        className="w-2.5 h-2.5 rounded-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-mono font-semibold text-white tabular-nums">
                      {formatCurrency(item.value, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 bg-[#0F1224] rounded-2xl border border-white/12 p-6 space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Annual Financing Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Principal vs. interest paid per year
                </p>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={yearlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickFormatter={(v) => `Yr ${v}`}
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
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Principal" stackId="a" fill="#4ADE80" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Interest" stackId="a" fill="#A855F7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}
