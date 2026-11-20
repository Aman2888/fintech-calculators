import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { CALCULATORS_META } from '../data/calculatorsMeta';
import { CalculatorIcon } from './CalculatorIcon';
import { CurrencySelector } from './CurrencySelector';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredCalculators = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CALCULATORS_META;
    return CALCULATORS_META.filter(
      (calc) =>
        calc.name.toLowerCase().includes(q) ||
        calc.shortDescription.toLowerCase().includes(q) ||
        calc.categoryLabel.toLowerCase().includes(q)
    );
  }, [query]);

  const handleNavCategory = (category: 'loan' | 'investment') => {
    navigate(`/?category=${category}#calculators`);
    if (location.pathname === '/') {
      window.setTimeout(() => {
        document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  const handleSelectCalculator = (path: string) => {
    setSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0B0C1E]/92 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B4F434] rounded"
          >
            CALCULATE
          </Link>

          {/* Zone 2: Clean Single-line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                location.pathname === '/' && !location.search ? 'text-white font-semibold' : ''
              }`}
            >
              Homepage
            </Link>
            <button
              type="button"
              onClick={() => handleNavCategory('loan')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer"
            >
              Loan Calculators
            </button>
            <button
              type="button"
              onClick={() => handleNavCategory('investment')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer"
            >
              Investment
            </button>
            <Link
              to="/about"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                location.pathname === '/about' ? 'text-white font-semibold' : ''
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                location.pathname === '/contact' ? 'text-white font-semibold' : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Zone 3: Global Currency Switcher + Search Calculators + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <CurrencySelector />

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search calculators"
              className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B4F434]"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="hidden md:inline">Search Tools</span>
              <kbd className="hidden xl:inline-block text-[10px] font-mono bg-black/25 px-1.5 py-0.5 rounded text-indigo-100">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/15 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0E1028] px-4 py-4 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10"
            >
              Homepage
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleNavCategory('loan');
              }}
              className="w-full text-left block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              Loan Calculators
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleNavCategory('investment');
              }}
              className="w-full text-left block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              Investment Calculators
            </button>
            <Link
              to="/about"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Contact
            </Link>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search financial calculators"
        >
          <div
            className="w-full max-w-xl bg-[#12142D] rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCalculators.length > 0) {
                    e.preventDefault();
                    handleSelectCalculator(filteredCalculators[0].path);
                  }
                }}
                placeholder="Search loan, payment, interest, amortization, auto, HELOC..."
                className="w-full text-sm text-white placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
              {filteredCalculators.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400">
                  No calculators matched "{query}". Try "loan", "auto", or "interest".
                </div>
              ) : (
                filteredCalculators.map((calc) => (
                  <button
                    key={calc.slug}
                    type="button"
                    onClick={() => handleSelectCalculator(calc.path)}
                    className="w-full text-left px-4 py-3.5 hover:bg-white/5 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/10 text-[#B4F434] flex items-center justify-center shrink-0 group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                        <CalculatorIcon name={calc.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {calc.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {calc.shortDescription}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#B4F434] shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
