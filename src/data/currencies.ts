export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
  decimals: number;
  countryKeywords: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    locale: 'en-US',
    decimals: 2,
    countryKeywords: 'united states america usa dollar',
  },
  {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: 'Rs',
    flag: '🇵🇰',
    locale: 'en-PK',
    decimals: 2,
    countryKeywords: 'pakistan rupee karachi lahore islamabad',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    locale: 'en-GB',
    decimals: 2,
    countryKeywords: 'united kingdom uk britain england pound sterling',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    locale: 'nl-NL',
    decimals: 2,
    countryKeywords: 'europe eurozone germany france spain italy netherlands',
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    locale: 'en-US',
    decimals: 2,
    countryKeywords: 'canada cad dollar toronto vancouver',
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    locale: 'en-US',
    decimals: 2,
    countryKeywords: 'australia aud dollar sydney melbourne',
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    locale: 'en-AE',
    decimals: 2,
    countryKeywords: 'united arab emirates dubai abu dhabi dirham',
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    flag: '🇸🇦',
    locale: 'en-SA',
    decimals: 2,
    countryKeywords: 'saudi arabia riyadh jeddah riyal',
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    locale: 'en-IN',
    decimals: 2,
    countryKeywords: 'india rupee mumbai delhi bangalore',
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    locale: 'ja-JP',
    decimals: 0,
    countryKeywords: 'japan yen tokyo osaka',
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    flag: '🇨🇳',
    locale: 'zh-CN',
    decimals: 2,
    countryKeywords: 'china yuan renminbi rmb beijing shanghai',
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    flag: '🇨🇭',
    locale: 'de-CH',
    decimals: 2,
    countryKeywords: 'switzerland swiss franc zurich geneva',
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    locale: 'en-SG',
    decimals: 2,
    countryKeywords: 'singapore dollar',
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    flag: '🇿🇦',
    locale: 'en-ZA',
    decimals: 2,
    countryKeywords: 'south africa rand johannesburg cape town',
  },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCY_MAP[code] ?? CURRENCY_MAP.USD;
}

/**
 * Purely client-side browser locale/timezone heuristic to suggest a regional currency.
 * Never overrides user selection or the USD default automatically.
 */
export function detectSuggestedCurrency(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (typeof navigator !== 'undefined' ? navigator.language : '') || '';
    const tzLower = tz.toLowerCase();
    const langLower = lang.toLowerCase();

    if (tzLower.includes('karachi') || langLower.endsWith('-pk')) return 'PKR';
    if (tzLower.includes('london') || langLower === 'en-gb') return 'GBP';
    if (tzLower.includes('dubai') || langLower.endsWith('-ae')) return 'AED';
    if (tzLower.includes('riyadh') || langLower.endsWith('-sa')) return 'SAR';
    if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || langLower.endsWith('-in'))
      return 'INR';
    if (tzLower.includes('tokyo') || langLower.startsWith('ja')) return 'JPY';
    if (tzLower.includes('shanghai') || langLower === 'zh-cn') return 'CNY';
    if (tzLower.includes('zurich') || langLower.endsWith('-ch')) return 'CHF';
    if (tzLower.includes('singapore') || langLower.endsWith('-sg')) return 'SGD';
    if (tzLower.includes('johannesburg') || langLower.endsWith('-za')) return 'ZAR';
    if (
      tzLower.includes('toronto') ||
      tzLower.includes('vancouver') ||
      langLower === 'en-ca' ||
      langLower === 'fr-ca'
    )
      return 'CAD';
    if (tzLower.includes('sydney') || tzLower.includes('melbourne') || langLower === 'en-au')
      return 'AUD';
    if (
      tzLower.startsWith('europe/') &&
      !tzLower.includes('london') &&
      !tzLower.includes('zurich')
    )
      return 'EUR';
    return null;
  } catch {
    return null;
  }
}
