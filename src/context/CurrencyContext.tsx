import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CURRENCY_MAP,
  type CurrencyInfo,
  detectSuggestedCurrency,
  getCurrencyInfo,
} from '../data/currencies';
import { formatCompactCurrencyFor, formatCurrencyFor } from '../lib/format';

const STORAGE_CURRENCY_KEY = 'calculate_currency_v1';
const STORAGE_RATES_KEY = 'calculate_fx_rates_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CachedRatesPayload {
  base: 'USD';
  rates: Record<string, number>;
  fetchedAt: number;
  updatedAtLabel: string;
  provider: string;
}

export type RateStatus = 'live' | 'cached' | 'unavailable' | 'loading';

export interface ScaledFieldSpec {
  min: number;
  max: number;
  sliderMax: number;
  step: number;
}

interface CurrencyContextValue {
  currency: string;
  currencyInfo: CurrencyInfo;
  rates: Record<string, number>;
  /** Current exchange rate relative to 1 USD, or null if live fetch failed and no cached rate exists */
  activeRate: number | null;
  rateStatus: RateStatus;
  rateError: string | null;
  lastUpdatedLabel: string | null;
  suggestedCurrency: string | null;
  setCurrency: (code: string) => void;
  dismissSuggestion: () => void;
  refreshRates: () => Promise<void>;
  getRateFor: (code: string) => number | null;
  convertAmount: (amount: number, fromCode: string, toCode: string) => number | null;
  scaleUsdAmount: (usdAmount: number, decimals?: number) => number;
  scaleFieldSpec: (baseUsd: ScaledFieldSpec) => ScaledFieldSpec;
  formatCurrency: (value: number, decimals?: number) => string;
  formatCompactCurrency: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readSavedCurrency(): string {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
    if (saved && CURRENCY_MAP[saved]) return saved;
  } catch {
    // ignore storage errors
  }
  return 'USD';
}

function readCachedRates(): CachedRatesPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_RATES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRatesPayload;
    if (
      parsed &&
      parsed.base === 'USD' &&
      parsed.rates &&
      typeof parsed.rates.USD === 'number' &&
      typeof parsed.fetchedAt === 'number'
    ) {
      return parsed;
    }
  } catch {
    // ignore malformed cache
  }
  return null;
}

function writeCachedRates(payload: CachedRatesPayload): void {
  try {
    localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}

function niceRoundStep(rawStep: number): number {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let nice = 1;
  if (normalized >= 7.5) nice = 10;
  else if (normalized >= 3.5) nice = 5;
  else if (normalized >= 1.75) nice = 2.5;
  else if (normalized >= 1.25) nice = 2;
  else nice = 1;
  return Math.max(1, Math.round(nice * magnitude));
}

function niceRoundBoundary(rawValue: number): number {
  if (!Number.isFinite(rawValue) || rawValue <= 0) return 0;
  if (rawValue < 100) return Math.max(1, Math.round(rawValue));
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawValue)) - 1);
  return Math.round(rawValue / magnitude) * magnitude;
}

async function fetchLiveUsdRates(): Promise<CachedRatesPayload> {
  // Primary provider: ExchangeRate-API Open Access (CORS enabled, no API key required)
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 7000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data?.result === 'success' && data?.rates && typeof data.rates.EUR === 'number') {
        const rates: Record<string, number> = { USD: 1 };
        for (const code of Object.keys(CURRENCY_MAP)) {
          if (typeof data.rates[code] === 'number' && data.rates[code] > 0) {
            rates[code] = data.rates[code];
          }
        }
        return {
          base: 'USD',
          rates,
          fetchedAt: Date.now(),
          updatedAtLabel: data.time_last_update_utc
            ? new Date(data.time_last_update_utc).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Live',
          provider: 'ExchangeRate-API',
        };
      }
    }
  } catch {
    // Fall through to secondary live endpoint
  }

  // Secondary live provider: Fawaz Ahmed Open Currency API via jsDelivr CDN
  const controller2 = new AbortController();
  const timer2 = window.setTimeout(() => controller2.abort(), 7000);
  const res2 = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    { signal: controller2.signal }
  );
  window.clearTimeout(timer2);
  if (!res2.ok) {
    throw new Error('Exchange rate API unavailable');
  }
  const data2 = await res2.json();
  if (!data2?.usd || typeof data2.usd.eur !== 'number') {
    throw new Error('Invalid exchange rate response');
  }

  const rates: Record<string, number> = { USD: 1 };
  for (const code of Object.keys(CURRENCY_MAP)) {
    const val = data2.usd[code.toLowerCase()];
    if (typeof val === 'number' && val > 0) {
      rates[code] = val;
    }
  }

  return {
    base: 'USD',
    rates,
    fetchedAt: Date.now(),
    updatedAtLabel: data2.date || 'Live',
    provider: 'Currency-API',
  };
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(() => readSavedCurrency());
  const [initialCache] = useState<CachedRatesPayload | null>(() => readCachedRates());

  const [rates, setRates] = useState<Record<string, number>>(
    () => initialCache?.rates ?? { USD: 1 }
  );
  const [rateStatus, setRateStatus] = useState<RateStatus>(() => {
    if (!initialCache) return 'loading';
    return Date.now() - initialCache.fetchedAt < CACHE_TTL_MS ? 'live' : 'cached';
  });
  const [rateError, setRateError] = useState<string | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string | null>(
    () => initialCache?.updatedAtLabel ?? null
  );

  const [suggestedCurrency, setSuggestedCurrency] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
      if (saved) return null;
    } catch {
      // ignore
    }
    const detected = detectSuggestedCurrency();
    return detected && detected !== 'USD' ? detected : null;
  });

  const refreshRates = useCallback(async () => {
    setRateError(null);
    setRateStatus((prev) => (Object.keys(rates).length <= 1 ? 'loading' : prev));
    try {
      const payload = await fetchLiveUsdRates();
      setRates(payload.rates);
      setRateStatus('live');
      setLastUpdatedLabel(payload.updatedAtLabel);
      setRateError(null);
      writeCachedRates(payload);
    } catch {
      const fallbackCache = readCachedRates();
      if (fallbackCache && Object.keys(fallbackCache.rates).length > 1) {
        setRates(fallbackCache.rates);
        setRateStatus('cached');
        setLastUpdatedLabel(fallbackCache.updatedAtLabel);
        setRateError('Exchange rate could not be updated. Using last cached rates.');
      } else {
        setRateStatus('unavailable');
        setRateError(
          'Live exchange rate could not be updated. Amounts are shown in the selected currency format without conversion.'
        );
      }
    }
  }, [rates]);

  useEffect(() => {
    const cacheFresh = initialCache && Date.now() - initialCache.fetchedAt < CACHE_TTL_MS;
    if (!cacheFresh) {
      void refreshRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = useCallback((code: string) => {
    const normalized = CURRENCY_MAP[code] ? code : 'USD';
    setCurrencyState(normalized);
    setSuggestedCurrency(null);
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, normalized);
    } catch {
      // ignore storage errors
    }
  }, []);

  const dismissSuggestion = useCallback(() => {
    setSuggestedCurrency(null);
  }, []);

  const currencyInfo = useMemo(() => getCurrencyInfo(currency), [currency]);

  const getRateFor = useCallback(
    (code: string): number | null => {
      if (code === 'USD') return 1;
      const r = rates[code];
      return typeof r === 'number' && Number.isFinite(r) && r > 0 ? r : null;
    },
    [rates]
  );

  const activeRate = useMemo(() => getRateFor(currency), [getRateFor, currency]);

  const convertAmount = useCallback(
    (amount: number, fromCode: string, toCode: string): number | null => {
      if (!Number.isFinite(amount)) return 0;
      if (fromCode === toCode) return amount;
      const fromRate = getRateFor(fromCode);
      const toRate = getRateFor(toCode);
      if (fromRate === null || toRate === null) return null;
      return (amount / fromRate) * toRate;
    },
    [getRateFor]
  );

  const scaleUsdAmount = useCallback(
    (usdAmount: number, decimals = currencyInfo.decimals): number => {
      if (!Number.isFinite(usdAmount)) return 0;
      if (activeRate === null || currency === 'USD') return usdAmount;
      const raw = usdAmount * activeRate;
      if (decimals === 0) return Math.round(raw);
      return niceRoundBoundary(raw);
    },
    [activeRate, currency, currencyInfo.decimals]
  );

  const scaleFieldSpec = useCallback(
    (baseUsd: ScaledFieldSpec): ScaledFieldSpec => {
      if (activeRate === null || currency === 'USD') {
        return baseUsd;
      }
      const scaledMin =
        baseUsd.min === 0 ? 0 : Math.max(1, niceRoundBoundary(baseUsd.min * activeRate));
      const scaledSliderMax = Math.max(
        scaledMin + 10,
        niceRoundBoundary(baseUsd.sliderMax * activeRate)
      );
      const scaledMax = Math.max(
        scaledSliderMax,
        niceRoundBoundary(baseUsd.max * activeRate)
      );
      const scaledStep = niceRoundStep(baseUsd.step * activeRate);

      return {
        min: scaledMin,
        max: scaledMax,
        sliderMax: scaledSliderMax,
        step: scaledStep,
      };
    },
    [activeRate, currency]
  );

  const formatCurrency = useCallback(
    (value: number, decimals?: number) => formatCurrencyFor(value, currency, decimals),
    [currency]
  );

  const formatCompactCurrency = useCallback(
    (value: number) => formatCompactCurrencyFor(value, currency),
    [currency]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      currencyInfo,
      rates,
      activeRate,
      rateStatus,
      rateError,
      lastUpdatedLabel,
      suggestedCurrency,
      setCurrency,
      dismissSuggestion,
      refreshRates,
      getRateFor,
      convertAmount,
      scaleUsdAmount,
      scaleFieldSpec,
      formatCurrency,
      formatCompactCurrency,
    }),
    [
      currency,
      currencyInfo,
      rates,
      activeRate,
      rateStatus,
      rateError,
      lastUpdatedLabel,
      suggestedCurrency,
      setCurrency,
      dismissSuggestion,
      refreshRates,
      getRateFor,
      convertAmount,
      scaleUsdAmount,
      scaleFieldSpec,
      formatCurrency,
      formatCompactCurrency,
    ]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used inside CurrencyProvider');
  }
  return ctx;
}
