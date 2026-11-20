import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { calculateStandardLoan } from '../lib/calculators';
import { AnimatedNumber } from './motion/AnimatedNumber';

export function HeroMiniCalculator() {
  const {
    currency,
    currencyInfo,
    activeRate,
    getRateFor,
    scaleUsdAmount,
    scaleFieldSpec,
    formatCurrency,
  } = useCurrency();

  const [amount, setAmount] = useState<number>(() => scaleUsdAmount(250000, 0));
  const [rate, setRate] = useState(6.25);
  const [years, setYears] = useState(30);

  const prevCurrencyRef = useRef(currency);
  const prevRateRef = useRef<number | null>(activeRate);

  useEffect(() => {
    const prevCurrency = prevCurrencyRef.current;
    const prevRate = prevRateRef.current;

    if (prevCurrency === currency) {
      if (currency !== 'USD' && prevRate === null && activeRate !== null) {
        setAmount((prev) => Math.round(prev * activeRate));
        prevRateRef.current = activeRate;
      }
      return;
    }

    const effectivePrevRate = prevRate ?? getRateFor(prevCurrency);
    if (effectivePrevRate !== null && activeRate !== null) {
      const ratio = activeRate / effectivePrevRate;
      setAmount((prev) => Math.round(prev * ratio));
      prevRateRef.current = activeRate;
    } else {
      prevRateRef.current = activeRate;
    }
    prevCurrencyRef.current = currency;
  }, [currency, activeRate, getRateFor]);

  const amountSpec = useMemo(
    () =>
      scaleFieldSpec({
        min: 10000,
        max: 1000000,
        sliderMax: 1000000,
        step: 5000,
      }),
    [scaleFieldSpec]
  );

  const clampedSliderAmount = Math.min(amountSpec.max, Math.max(amountSpec.min, amount));
  const amountPct =
    amountSpec.max > amountSpec.min
      ? ((clampedSliderAmount - amountSpec.min) / (amountSpec.max - amountSpec.min)) * 100
      : 0;

  const result = useMemo(
    () => calculateStandardLoan(amount, rate, years * 12),
    [amount, rate, years]
  );

  const donutData = [
    { name: 'Principal', value: Math.round(result.principal), color: '#10B981' },
    { name: 'Interest', value: Math.round(result.totalInterest), color: '#818CF8' },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-[#12142D] rounded-2xl border border-white/12 shadow-[0_24px_64px_rgba(0,0,0,0.45)] p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-xs font-medium text-[#B4F434]">
            Calculator Preview · {currencyInfo.flag} {currency}
          </div>
          <h3 className="font-display text-lg font-bold text-white mt-0.5">
            Live Loan Breakdown
          </h3>
        </div>
        <Link
          to="/calculators/loan-calculator"
          className="text-xs font-semibold text-indigo-300 hover:text-[#B4F434] transition-colors whitespace-nowrap"
        >
          Open Full Tool
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Sliders */}
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="preview-amount" className="font-medium text-slate-300">
                Loan Amount ({currencyInfo.symbol})
              </label>
              <span className="font-mono font-semibold text-white tabular-nums">
                {formatCurrency(amount, 0)}
              </span>
            </div>
            <input
              id="preview-amount"
              type="range"
              min={amountSpec.min}
              max={amountSpec.max}
              step={amountSpec.step}
              value={clampedSliderAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${amountPct}%, rgba(255,255,255,0.12) ${amountPct}%, rgba(255,255,255,0.12) 100%)`,
                ['--slider-thumb' as string]: '#38BDF8',
              }}
              className="w-full calc-slider"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="preview-rate" className="font-medium text-slate-300">
                Annual Interest Rate
              </label>
              <span className="font-mono font-semibold text-white tabular-nums">
                {rate.toFixed(2)}%
              </span>
            </div>
            <input
              id="preview-rate"
              type="range"
              min={0}
              max={15}
              step={0.125}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #F97316 0%, #F97316 ${
                  (rate / 15) * 100
                }%, rgba(255,255,255,0.12) ${(rate / 15) * 100}%, rgba(255,255,255,0.12) 100%)`,
                ['--slider-thumb' as string]: '#F97316',
              }}
              className="w-full calc-slider"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="preview-years" className="font-medium text-slate-300">
                Loan Term
              </label>
              <span className="font-mono font-semibold text-white tabular-nums">
                {years} years
              </span>
            </div>
            <input
              id="preview-years"
              type="range"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #A855F7 0%, #A855F7 ${
                  ((years - 1) / 29) * 100
                }%, rgba(255,255,255,0.12) ${
                  ((years - 1) / 29) * 100
                }%, rgba(255,255,255,0.12) 100%)`,
                ['--slider-thumb' as string]: '#A855F7',
              }}
              className="w-full calc-slider"
            />
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Monthly Payment</div>
              <div className="font-mono text-2xl font-bold text-[#B4F434] mt-0.5">
                <AnimatedNumber value={result.monthlyPayment} format="currency" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total Interest</div>
              <div className="font-mono text-sm font-semibold text-white mt-0.5">
                <AnimatedNumber value={result.totalInterest} format="currency-int" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Donut Chart */}
        <div className="md:col-span-5 bg-black/25 rounded-2xl border border-white/8 p-4 flex flex-col items-center justify-between">
          <div className="text-xs font-medium text-slate-300 self-start">
            Principal vs. Interest
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={66}
                  paddingAngle={3}
                  stroke="none"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v ?? 0))}
                  contentStyle={{
                    backgroundColor: '#0B0C1E',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
              {result.principalSharePercent.toFixed(0)}% Principal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#818CF8]" />
              {result.interestSharePercent.toFixed(0)}% Interest
            </span>
          </div>
        </div>
      </div>

      <Link
        to={`/calculators/loan-amortization-calculator?amount=${amount}&rate=${rate}&years=${years}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#B4F434] hover:bg-[#a3e635] text-[#090A1A] text-sm font-bold transition-colors"
      >
        <span>Launch Full Amortization Schedule</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
