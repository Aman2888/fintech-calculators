import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { CALCULATORS_META, type CalculatorCategory } from '../data/calculatorsMeta';
import { CalculatorIcon } from '../components/CalculatorIcon';
import { HeroMiniCalculator } from '../components/HeroMiniCalculator';
import { AtmosphericBackdrop } from '../components/motion/AtmosphericBackdrop';
import { InteractiveBentoCard } from '../components/motion/InteractiveBentoCard';
import { RevealSection } from '../components/motion/RevealSection';
import { ThreeShowcase } from '../components/three/ThreeShowcase';
import { BentoCardArt } from '../components/visuals/BentoCardArt';

type FilterTab = 'all' | CalculatorCategory;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Calculators' },
  { id: 'loan', label: 'Loan Tools' },
  { id: 'auto-credit', label: 'Auto & HELOC' },
  { id: 'investment', label: 'Compound Growth' },
];

interface BentoStyle {
  bg: string;
  text: string;
  subtext: string;
  badgeBg: string;
  ctaText: string;
}

const CARD_STYLES: Record<string, BentoStyle> = {
  'loan-calculator': {
    bg: 'bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E3A8A] border-blue-400/25',
    text: 'text-white',
    subtext: 'text-blue-100',
    badgeBg: 'bg-white/15 text-white',
    ctaText: 'text-white',
  },
  'loan-payment-calculator': {
    bg: 'bg-gradient-to-br from-[#FF7847] to-[#EA431B] border-orange-300/25',
    text: 'text-white',
    subtext: 'text-orange-100',
    badgeBg: 'bg-white/15 text-white',
    ctaText: 'text-white',
  },
  'loan-interest-calculator': {
    bg: 'bg-gradient-to-br from-[#4338CA] via-[#5B21B6] to-[#3B0764] border-violet-400/25',
    text: 'text-white',
    subtext: 'text-indigo-100',
    badgeBg: 'bg-white/15 text-white',
    ctaText: 'text-white',
  },
  'loan-amortization-calculator': {
    bg: 'bg-gradient-to-br from-[#7E22CE] to-[#9333EA] border-purple-300/25',
    text: 'text-white',
    subtext: 'text-purple-100',
    badgeBg: 'bg-white/15 text-white',
    ctaText: 'text-white',
  },
  'auto-loan-calculator': {
    bg: 'bg-gradient-to-br from-[#BEF264] to-[#84CC16] border-lime-300/40',
    text: 'text-[#090A1A]',
    subtext: 'text-[#1A2E05]',
    badgeBg: 'bg-[#090A1A]/12 text-[#090A1A]',
    ctaText: 'text-[#090A1A]',
  },
  'heloc-calculator': {
    bg: 'bg-gradient-to-br from-[#5EEAD4] to-[#06B6D4] border-teal-200/40',
    text: 'text-[#090A1A]',
    subtext: 'text-[#083344]',
    badgeBg: 'bg-[#090A1A]/12 text-[#090A1A]',
    ctaText: 'text-[#090A1A]',
  },
  'compound-interest-calculator': {
    bg: 'bg-gradient-to-br from-[#151936] to-[#0D1024] border-emerald-400/30',
    text: 'text-white',
    subtext: 'text-slate-300',
    badgeBg: 'bg-emerald-400/15 text-[#34D399]',
    ctaText: 'text-[#34D399]',
  },
};

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const initialCategory = (searchParams.get('category') as FilterTab) || 'all';
  const [activeFilter, setActiveFilter] = useState<FilterTab>(
    ['all', 'loan', 'auto-credit', 'investment'].includes(initialCategory)
      ? initialCategory
      : 'all'
  );

  useEffect(() => {
    document.title = 'CALCULATE — Money Moves. Made Simple. | Financial Calculators';
  }, []);

  useEffect(() => {
    const paramCat = searchParams.get('category') as FilterTab | null;
    if (paramCat && ['all', 'loan', 'auto-credit', 'investment'].includes(paramCat)) {
      setActiveFilter(paramCat);
    } else if (!paramCat) {
      setActiveFilter('all');
    }
  }, [searchParams]);

  useEffect(() => {
    if (location.hash === '#calculators') {
      const timer = window.setTimeout(() => {
        document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [location.hash, location.search]);

  const handleFilterChange = (tab: FilterTab) => {
    setActiveFilter(tab);
    if (tab === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category: tab }, { replace: true });
    }
  };

  const visibleCalculators =
    activeFilter === 'all'
      ? CALCULATORS_META
      : CALCULATORS_META.filter((c) => c.category === activeFilter);

  return (
    <div className="bg-midnight-mesh text-white">
      {/* Hero Section with Atmospheric Kinetic Orbs */}
      <section className="relative overflow-hidden border-b border-white/10">
        <AtmosphericBackdrop />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="text-xs font-semibold text-[#B4F434]">
                Fintech Calculators · Real-Time 3D &amp; Visual Math
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-[4rem] font-extrabold tracking-tight text-white leading-[1.03] text-balance">
                Money Moves.
                <br />
                Made Simple.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-md">
                Calculate smarter. Borrow better. Build your future.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-indigo-950/50"
                >
                  <span>Explore Calculators</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </motion.button>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/calculators/loan-calculator"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Calculate Your Loan</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Hero Right: 3D Tilted Calculator + Floating Gold Coins */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative"
            >
              <ThreeShowcase variant="calculator" className="w-full h-96 sm:h-[480px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Calculator Collection Bento Grid */}
      <section id="calculators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Calculator Collection
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Seven distinct financial workspaces tailored to loans, vehicles, home equity, and wealth.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter calculators by category"
            className="inline-flex flex-wrap items-center gap-1 p-1.5 bg-white/5 border border-white/10 rounded-xl self-start lg:self-auto"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${isActive ? 'text-[#090A1A]' : 'text-slate-300 hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterPill"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="absolute inset-0 rounded-lg bg-[#B4F434]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </RevealSection>

        {/* Interactive 3D-Tilt Bento Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${activeFilter === 'all' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            } gap-5`}
        >
          {visibleCalculators.map((calc, index) => {
            const style = CARD_STYLES[calc.slug] ?? CARD_STYLES['compound-interest-calculator'];

            return (
              <InteractiveBentoCard key={calc.slug} index={index}>
                <Link
                  to={calc.path}
                  className={`group h-full rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-shadow duration-200 hover:shadow-2xl ${style.bg}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-transform duration-200 group-hover:scale-110 ${style.badgeBg}`}
                      >
                        <CalculatorIcon name={calc.iconName} className="w-3.5 h-3.5" />
                      </span>
                      <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${style.badgeBg}`}>
                        0{index + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className={`font-display text-lg font-bold leading-tight ${style.text}`}>
                        {calc.name}
                      </h3>
                      <p className={`text-xs mt-1 leading-snug line-clamp-2 ${style.subtext}`}>
                        {calc.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="h-20 overflow-hidden">
                    <BentoCardArt slug={calc.slug} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${style.ctaText}`}>Open Calculator</span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${style.ctaText}`}
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </InteractiveBentoCard>
            );
          })}
        </div>
      </section>

      {/* Feature Section ("Unlock Financial Clarity") + Live Calculator Preview */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#070816]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <RevealSection className="lg:col-span-5 space-y-6">
              <div className="text-xs font-semibold text-[#10B981]">
                Interactive Financial Clarity
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                Unlock Financial Clarity
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Adjust loan amounts, compare interest rates, and simulate compounding growth in
                real time. Every tool runs transparently in your browser with instant charts and
                exportable schedules.
              </p>

              <div className="rounded-2xl bg-[#10132A] border border-white/10 p-4">
                <ThreeShowcase variant="plant" className="w-full h-56" accentValue={0.7} />
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/calculators/compound-interest-calculator"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#070816] text-sm font-bold transition-colors"
                  >
                    <span>Compound Interest Tool</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </motion.div>
              </div>
            </RevealSection>

            <RevealSection delay={0.1} className="lg:col-span-7">
              <HeroMiniCalculator />
            </RevealSection>
          </div>
        </div>
      </section>
    </div>
  );
}
