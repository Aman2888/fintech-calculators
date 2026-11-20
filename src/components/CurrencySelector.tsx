import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Check, ChevronDown, RefreshCw, Search, Sparkles, X } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencyInfo, SUPPORTED_CURRENCIES } from '../data/currencies';

export function CurrencySelector() {
  const {
    currency,
    currencyInfo,
    rates,
    rateStatus,
    rateError,
    lastUpdatedLabel,
    suggestedCurrency,
    setCurrency,
    dismissSuggestion,
    refreshRates,
  } = useCurrency();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [retrying, setRetrying] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setSearch('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SUPPORTED_CURRENCIES;
    return SUPPORTED_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.countryKeywords.includes(q)
    );
  }, [search]);

  const suggestedInfo = suggestedCurrency ? getCurrencyInfo(suggestedCurrency) : null;
  const activeRate = currency === 'USD' ? 1 : rates[currency];
  const hasConversionWarning =
    rateStatus === 'unavailable' || (currency !== 'USD' && typeof activeRate !== 'number');

  const handleRetry = async () => {
    setRetrying(true);
    await refreshRates();
    setRetrying(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Active currency: ${currencyInfo.name} (${currencyInfo.code})`}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B4F434] ${hasConversionWarning
            ? 'border-amber-400/60 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25'
            : open
              ? 'border-[#B4F434] bg-[#1A1D3D] text-white shadow-[0_0_20px_rgba(180,244,52,0.18)]'
              : 'border-white/15 bg-white/6 hover:bg-white/12 text-white'
          }`}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {currencyInfo.flag}
        </span>
        <span className="font-mono tracking-tight">{currencyInfo.code}</span>
        <span className="hidden sm:inline text-xs font-mono text-[#B4F434]">
          ({currencyInfo.symbol})
        </span>
        {hasConversionWarning && (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-[#B4F434]' : ''
            }`}
          aria-hidden="true"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-[310px] sm:w-[340px] rounded-2xl bg-[#131533] border border-purple-400/25 shadow-[0_24px_64px_rgba(5,6,20,0.85)] overflow-hidden z-50"
          >
            {/* Header & Search */}
            <div className="p-3 border-b border-white/10 bg-[#181B42]/70 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-purple-200">
                  Global Currency
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {SUPPORTED_CURRENCIES.length} currencies
                </span>
              </div>

              <div className="relative flex items-center">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filtered.length > 0) {
                      e.preventDefault();
                      setCurrency(filtered[0].code);
                      setOpen(false);
                    }
                  }}
                  placeholder="Search USD, PKR, EUR, India, Yen..."
                  aria-label="Search currency"
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-[#0B0C1E] border border-white/12 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#B4F434]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear currency search"
                    className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Optional Region Suggestion Chip */}
              {suggestedInfo && suggestedInfo.code !== currency && (
                <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency(suggestedInfo.code);
                      setOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-left text-indigo-100 hover:text-[#B4F434] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B4F434] shrink-0" aria-hidden="true" />
                    <span>
                      Region match: <strong>{suggestedInfo.flag} {suggestedInfo.code}</strong>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={dismissSuggestion}
                    aria-label="Dismiss region suggestion"
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Currency Options */}
            <div
              role="listbox"
              aria-label="Currency list"
              className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {filtered.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-slate-400">
                  No currencies matched &ldquo;{search}&rdquo;.
                </div>
              ) : (
                filtered.map((item) => {
                  const isSelected = item.code === currency;
                  const itemRate = item.code === 'USD' ? 1 : rates[item.code];
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setCurrency(item.code);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${isSelected
                          ? 'bg-[#B4F434] text-[#090A1A] font-bold shadow-md shadow-[#B4F434]/15'
                          : 'text-slate-200 hover:bg-purple-500/15 hover:text-white'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none shrink-0" aria-hidden="true">
                          {item.flag}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span className="font-mono">{item.code}</span>
                            <span
                              className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md ${isSelected
                                  ? 'bg-[#090A1A]/15 text-[#090A1A]'
                                  : 'bg-white/8 text-slate-300'
                                }`}
                            >
                              {item.symbol}
                            </span>
                          </div>
                          <div
                            className={`text-[11px] truncate ${isSelected ? 'text-[#1A2E05] font-medium' : 'text-slate-400'
                              }`}
                          >
                            {item.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {typeof itemRate === 'number' && item.code !== 'USD' && (
                          <span
                            className={`font-mono text-[11px] tabular-nums ${isSelected ? 'text-[#1A2E05]' : 'text-slate-400'
                              }`}
                          >
                            {itemRate >= 100
                              ? itemRate.toFixed(1)
                              : itemRate.toFixed(2)}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#090A1A]" aria-hidden="true" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Exchange Rate Status Footer */}
            <div className="px-3.5 py-2.5 border-t border-white/10 bg-[#0D0F24] flex items-center justify-between gap-2 text-[11px]">
              {rateError ? (
                <div className="flex items-center gap-1.5 text-amber-300 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{rateError}</span>
                </div>
              ) : currency === 'USD' ? (
                <span className="text-slate-400">
                  Base USD · {lastUpdatedLabel ? `Rates: ${lastUpdatedLabel}` : 'Live FX ready'}
                </span>
              ) : typeof activeRate === 'number' ? (
                <span className="text-slate-300 font-mono truncate tabular-nums">
                  1 USD = {activeRate >= 10 ? activeRate.toFixed(2) : activeRate.toFixed(4)}{' '}
                  {currency}
                </span>
              ) : (
                <span className="text-amber-300">Rate unavailable</span>
              )}

              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                aria-label="Refresh exchange rates"
                className="inline-flex items-center gap-1 text-[#B4F434] hover:text-white font-semibold shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>{retrying ? 'Syncing' : 'Refresh'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
