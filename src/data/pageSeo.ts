import { CALCULATORS_META } from './calculatorsMeta';

const pages = [
  { path: '/', title: 'Financial Calculators for Loans and Savings', description: 'Estimate loan payments, borrowing costs, HELOC payments and compound interest with seven interactive financial calculators.' },
  { path: '/guides', title: 'Guide to Comparing Loans and Savings', description: 'Compare fixed-rate payments, auto loan rates, home equity loans and HELOCs. See worked examples for debt payoff and savings growth.' },
  { path: '/about', title: 'About EasyLoanCalc Financial Tools', description: 'Learn how EasyLoanCalc models loan repayment, line-of-credit costs and savings growth, and how it handles your calculator inputs.' },
  { path: '/contact', title: 'Contact EasyLoanCalc', description: 'Find contact information for EasyLoanCalc and share feedback about calculator results, accessibility or feature requests.' },
  { path: '/privacy', title: 'Privacy Policy', description: 'Learn how EasyLoanCalc handles calculator inputs, currency data and information you choose to share.' },
  { path: '/terms', title: 'Terms and Conditions', description: 'Read the terms for using EasyLoanCalc and the limitations of its educational financial estimates.' },
];

export const seoPaths = [...pages.map(({ path }) => path), ...CALCULATORS_META.map(({ path }) => path)];

export function getPageSeo(pathname: string, origin?: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const calculator = CALCULATORS_META.find((entry) => entry.path === path);
  const page = pages.find((entry) => entry.path === path);
  const name = calculator?.name ?? page?.title ?? 'Page Not Found';
  const description = calculator?.description ?? page?.description ?? 'This page could not be found. Browse the available EasyLoanCalc financial tools.';
  const canonical = origin && (calculator || page) ? new URL(path, origin).href : undefined;

  const schema = canonical && (calculator || path === '/') ? {
    '@context': 'https://schema.org',
    '@graph': calculator ? [
      { '@type': 'WebApplication', name, description, url: canonical, applicationCategory: 'FinanceApplication', operatingSystem: 'Any' },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', origin).href },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: new URL('/#calculators', origin).href },
        { '@type': 'ListItem', position: 3, name, item: canonical },
      ] },
    ] : [{ '@type': 'WebSite', name: 'EasyLoanCalc', url: canonical, description }],
  } : undefined;

  return { title: `${name} | EasyLoanCalc`, description, canonical, schema, robots: canonical ? 'index, follow' : 'noindex, follow' };
}

export function serializeSchema(schema: unknown) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
