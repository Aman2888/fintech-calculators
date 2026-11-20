import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Printer,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculatorExamples } from '../data/calculatorExamples';
import { CALCULATORS_META, type CalculatorMeta } from '../data/calculatorsMeta';
import { CalculatorIcon } from './CalculatorIcon';
import { RevealSection } from './motion/RevealSection';

export interface CalculatorThemeConfig {
  mode: 'dark' | 'light';
  pageBgClass: string;
  cardBgClass: string;
  accentTextClass: string;
  badgeBgClass?: string;
}

interface CalculatorLayoutProps {
  meta: CalculatorMeta;
  themeConfig: CalculatorThemeConfig;
  heroVisual?: ReactNode;
  formContent: ReactNode;
  resultsContent: ReactNode;
  breakdownContent?: ReactNode;
  onReset: () => void;
  copySummaryText: string;
}

export function CalculatorLayout({
  meta,
  themeConfig,
  heroVisual,
  formContent,
  resultsContent,
  breakdownContent,
  onReset,
  copySummaryText,
}: CalculatorLayoutProps) {
  const [copied, setCopied] = useState(false);
  const { currency, currencyInfo, rateError, rateStatus, refreshRates } = useCurrency();
  const isDark = themeConfig.mode === 'dark';

  const relatedCalculators = meta.relatedSlugs
    .map((slug) => CALCULATORS_META.find((c) => c.slug === slug))
    .filter((c): c is CalculatorMeta => Boolean(c));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copySummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = copySummaryText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${themeConfig.pageBgClass} min-h-screen`}>
      {/* Header & Breadcrumb */}
      <section
        className={`border-b ${
          isDark ? 'border-white/10' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-1.5 text-xs font-medium mb-4 no-print ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Link
              to="/"
              className={
                isDark
                  ? 'hover:text-white transition-colors'
                  : 'hover:text-[#14213D] transition-colors'
              }
            >
              Homepage
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            <Link
              to="/#calculators"
              className={
                isDark
                  ? 'hover:text-white transition-colors'
                  : 'hover:text-[#14213D] transition-colors'
              }
            >
              Calculators
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            <span aria-current="page" className={isDark ? 'text-white' : 'text-[#14213D]'}>{meta.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl space-y-2.5"
            >
              <div className={`text-xs font-semibold ${themeConfig.accentTextClass}`}>
                {meta.categoryLabel}
              </div>
              <h1
                className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance ${
                  isDark ? 'text-white' : 'text-[#14213D]'
                }`}
              >
                {meta.name}
              </h1>
              <p
                className={`text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {meta.description}
              </p>
            </motion.div>

            <div className="flex items-center gap-2.5 shrink-0 no-print">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-[#14213D]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 opacity-70" aria-hidden="true" />
                    <span>Copy Results</span>
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => window.print()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-[#14213D]'
                }`}
              >
                <Printer className="w-4 h-4 opacity-70" aria-hidden="true" />
                <span>Print</span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {(rateStatus === 'unavailable' || (rateError && currency !== 'USD')) && (
          <div
            role="status"
            className={`mb-6 rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm ${
              isDark
                ? 'bg-amber-500/12 border-amber-400/35 text-amber-100'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
              <span>
                {rateError ??
                  'Exchange rate could not be updated. Showing currency formatting without live conversion.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void refreshRates()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-100'
                  : 'bg-amber-200/70 hover:bg-amber-200 text-amber-950'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry Rate Sync</span>
            </button>
          </div>
        )}

        {heroVisual && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            {heroVisual}
          </motion.div>
        )}

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Input Form */}
          <div
            className={`lg:col-span-5 rounded-2xl border p-6 sm:p-7 space-y-6 no-print ${themeConfig.cardBgClass}`}
          >
            <div
              className={`flex items-center justify-between border-b pb-4 ${
                isDark ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-white/10 text-white' : 'bg-[#14213D]/5 text-[#14213D]'
                  }`}
                >
                  <CalculatorIcon name={meta.iconName} className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    className={`font-display text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-[#14213D]'
                    }`}
                  >
                    Calculator Parameters
                  </h2>
                  <div
                    className={`text-[11px] font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {currencyInfo.flag} {currency} ({currencyInfo.symbol})
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onReset}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-[#14213D] hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </motion.button>
            </div>

            <div className="space-y-6">{formContent}</div>
          </div>

          {/* Right Column: Live Results & Charts */}
          <div className="lg:col-span-7 space-y-6 print-full">{resultsContent}</div>
        </motion.div>

        {breakdownContent && (
          <RevealSection className="mt-8">{breakdownContent}</RevealSection>
        )}

        {/* Formula Explanation & Animated FAQs */}
        <RevealSection className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div
            className={`lg:col-span-5 rounded-2xl border p-6 sm:p-7 space-y-5 ${themeConfig.cardBgClass}`}
          >
            <div>
              <div className={`text-xs font-semibold mb-1 ${themeConfig.accentTextClass}`}>
                Calculation Methodology
              </div>
              <h2
                className={`font-display text-xl font-bold ${
                  isDark ? 'text-white' : 'text-[#14213D]'
                }`}
              >
                Formula Breakdown
              </h2>
            </div>

            <div
              className={`rounded-xl px-4 py-4 font-mono text-sm overflow-x-auto ${
                isDark
                  ? 'bg-black/40 text-[#B4F434] border border-white/10'
                  : 'bg-[#14213D] text-white'
              }`}
            >
              {meta.formulaLatex}
            </div>

            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {meta.formulaSummary}
            </p>

            <div className="space-y-2">
              <h3 className="font-display text-base font-semibold">Worked example in USD</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {calculatorExamples[meta.slug]}
              </p>
              <Link to="/guides" className="inline-block text-sm underline">Read the loan and savings guide</Link>
            </div>

            <div
              className={`border-t pt-4 space-y-2.5 ${
                isDark ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  isDark ? 'text-white' : 'text-[#14213D]'
                }`}
              >
                Variables
              </div>
              <dl className="space-y-2">
                {meta.formulaVariables.map((item) => (
                  <div key={item.symbol} className="flex items-baseline gap-3 text-sm">
                    <dt
                      className={`font-mono text-xs font-semibold min-w-[72px] shrink-0 ${themeConfig.accentTextClass}`}
                    >
                      {item.symbol}
                    </dt>
                    <dd className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      {item.meaning}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div
            className={`lg:col-span-7 rounded-2xl border p-6 sm:p-7 space-y-5 ${themeConfig.cardBgClass}`}
          >
            <div>
              <div className={`text-xs font-semibold mb-1 ${themeConfig.accentTextClass}`}>
                Planning Guidance
              </div>
              <h2
                className={`font-display text-xl font-bold ${
                  isDark ? 'text-white' : 'text-[#14213D]'
                }`}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200'}`}>
              {meta.faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0} className="group py-4 first:pt-1 last:pb-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className={`mt-2.5 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Related Calculators */}
        <RevealSection className="mt-12 no-print">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className={`font-display text-xl font-bold ${
                  isDark ? 'text-white' : 'text-[#14213D]'
                }`}
              >
                Related Financial Calculators
              </h2>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Explore companion tools to model your loan or investment plan.
              </p>
            </div>
            <Link
              to="/#calculators"
              className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isDark
                  ? 'text-slate-300 hover:text-[#B4F434]'
                  : 'text-[#14213D] hover:text-[#2563EB]'
              }`}
            >
              <span>All Calculators</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedCalculators.map((rel) => (
              <Link
                key={rel.slug}
                to={rel.path}
                className={`group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between gap-4 ${themeConfig.cardBgClass}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isDark
                          ? 'bg-white/10 text-white group-hover:bg-[#B4F434] group-hover:text-[#0B0C1E]'
                          : 'bg-slate-100 text-[#14213D] group-hover:bg-[#2563EB] group-hover:text-white'
                      }`}
                    >
                      <CalculatorIcon name={rel.iconName} className="w-5 h-5" />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {rel.categoryLabel.split('·')[0].trim()}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-display text-base font-bold transition-colors ${
                        isDark
                          ? 'text-white group-hover:text-[#B4F434]'
                          : 'text-[#14213D] group-hover:text-[#2563EB]'
                      }`}
                    >
                      {rel.name}
                    </h3>
                    <p
                      className={`text-sm mt-1 line-clamp-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {rel.shortDescription}
                    </p>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    isDark
                      ? 'text-white group-hover:text-[#B4F434]'
                      : 'text-[#14213D] group-hover:text-[#2563EB]'
                  }`}
                >
                  <span>Open Calculator</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </RevealSection>
      </section>
    </div>
  );
}
