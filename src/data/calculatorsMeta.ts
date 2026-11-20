export type CalculatorCategory = 'loan' | 'auto-credit' | 'investment';

export interface CalculatorFAQ {
  question: string;
  answer: string;
}

export interface CalculatorMeta {
  slug: string;
  path: string;
  name: string;
  shortName: string;
  category: CalculatorCategory;
  categoryLabel: string;
  description: string;
  shortDescription: string;
  iconName:
    | 'Calculator'
    | 'Wallet'
    | 'Percent'
    | 'TableProperties'
    | 'Car'
    | 'Home'
    | 'TrendingUp';
  highlightLabel: string;
  formulaLatex: string;
  formulaSummary: string;
  formulaVariables: { symbol: string; meaning: string }[];
  faqs: CalculatorFAQ[];
  relatedSlugs: string[];
}

export const CALCULATORS_META: CalculatorMeta[] = [
  {
    slug: 'loan-calculator',
    path: '/calculators/loan-calculator',
    name: 'Loan Calculator',
    shortName: 'Loan Calculator',
    category: 'loan',
    categoryLabel: 'Loan Planning · Core Payment',
    description:
      'Use this loan calculator to estimate the monthly payment, total interest and total repayment on a fixed-rate installment loan.',
    shortDescription:
      'Calculate fixed monthly payments, total repayment, and lifetime interest on any standard loan.',
    iconName: 'Calculator',
    highlightLabel: 'Monthly Payment',
    formulaLatex: 'M = P × [ i(1 + i)^n ] / [ (1 + i)^n − 1 ]',
    formulaSummary:
      'Standard amortizing loan payment formula with monthly compounding. When the interest rate is 0%, monthly payment equals Principal divided by total months.',
    formulaVariables: [
      { symbol: 'M', meaning: 'Fixed monthly loan payment' },
      { symbol: 'P', meaning: 'Original loan principal borrowed' },
      { symbol: 'i', meaning: 'Monthly interest rate (Annual Rate ÷ 12 ÷ 100)' },
      { symbol: 'n', meaning: 'Total number of monthly payments (Years × 12)' },
    ],
    faqs: [
      {
        question: 'How does loan term affect my monthly payment and total interest?',
        answer:
          'A longer term spreads the principal across more months, reducing your required monthly payment while increasing the total interest paid over the life of the loan.',
      },
      {
        question: 'Does this calculator support 0% APR financing?',
        answer:
          'Yes. Setting the annual interest rate to 0% automatically switches to linear principal division so your monthly payment equals Loan Amount ÷ Months.',
      },
      {
        question: 'Are lender origination fees included?',
        answer:
          'This calculation models pure principal and interest. If your lender charges an upfront origination fee added to the balance, include that amount in the Loan Amount field.',
      },
    ],
    relatedSlugs: ['loan-payment-calculator', 'loan-interest-calculator', 'loan-amortization-calculator'],
  },
  {
    slug: 'loan-payment-calculator',
    path: '/calculators/loan-payment-calculator',
    name: 'Loan Payment Calculator',
    shortName: 'Loan Payment',
    category: 'loan',
    categoryLabel: 'Loan Planning · P&I Split',
    description:
      'Use the loan payment calculator to estimate your monthly installment and see how each payment divides between principal and interest.',
    shortDescription:
      'Analyze monthly payment affordability alongside annual principal-versus-interest visual charts.',
    iconName: 'Wallet',
    highlightLabel: 'Monthly Payment',
    formulaLatex: 'Payment = Principal_m + (Balance_{m−1} × i)',
    formulaSummary:
      'Each fixed payment covers accrued monthly interest on the remaining balance first, with the remainder reducing your principal balance.',
    formulaVariables: [
      { symbol: 'Payment', meaning: 'Total constant monthly installment' },
      { symbol: 'Balance_{m−1}', meaning: 'Remaining principal balance from prior month' },
      { symbol: 'i', meaning: 'Periodic monthly interest rate' },
      { symbol: 'Principal_m', meaning: 'Portion applied directly to debt reduction' },
    ],
    faqs: [
      {
        question: 'Why is interest higher at the start of a loan?',
        answer:
          'Monthly interest is charged on your outstanding balance. Because your balance is highest in month one, early payments carry more interest and less principal.',
      },
      {
        question: 'Can I enter loan duration in months instead of years?',
        answer:
          'Yes. Use the Years / Months selector beside the duration input to model short-term 18-month or 36-month notes directly.',
      },
      {
        question: 'How can I shift more of my payment toward principal?',
        answer:
          'Choosing a shorter repayment duration, securing a lower APR, or making extra principal payments dramatically accelerates equity build.',
      },
    ],
    relatedSlugs: ['loan-calculator', 'loan-amortization-calculator', 'loan-interest-calculator'],
  },
  {
    slug: 'loan-interest-calculator',
    path: '/calculators/loan-interest-calculator',
    name: 'Loan Interest Calculator',
    shortName: 'Loan Interest',
    category: 'loan',
    categoryLabel: 'Cost Analysis · Borrowing Expense',
    description:
      'Use the loan interest calculator to estimate total interest paid, compare it with the amount borrowed and see how interest adds up over time.',
    shortDescription:
      'Quantify total interest paid, effective cost percentage, and interest burden before you sign.',
    iconName: 'Percent',
    highlightLabel: 'Total Interest Cost',
    formulaLatex: 'Total Interest = (M × n) − P',
    formulaSummary:
      'Total interest is the difference between the sum of all scheduled monthly payments and the original principal borrowed.',
    formulaVariables: [
      { symbol: 'M × n', meaning: 'Total cumulative dollars paid over the loan term' },
      { symbol: 'P', meaning: 'Initial principal amount borrowed' },
      { symbol: 'Interest %', meaning: 'Share of total repayment consumed by interest charges' },
    ],
    faqs: [
      {
        question: 'What is the difference between Interest Share % and Interest-to-Principal Ratio?',
        answer:
          'Interest Share % shows what percentage of your total payments goes to interest, while Interest-to-Principal Ratio compares total interest directly against the amount you borrowed.',
      },
      {
        question: 'How much difference does a 1% lower interest rate make?',
        answer:
          'On long-term loans such as 15- or 30-year notes, even a 1.00% rate reduction can save tens of thousands of dollars in cumulative interest.',
      },
      {
        question: 'When is borrowing cost considered high?',
        answer:
          'Whenever total interest approaches or exceeds 30–50% of the borrowed principal, shortening the term or refinancing at a lower rate yields substantial savings.',
      },
    ],
    relatedSlugs: ['loan-calculator', 'loan-amortization-calculator', 'heloc-calculator'],
  },
  {
    slug: 'loan-amortization-calculator',
    path: '/calculators/loan-amortization-calculator',
    name: 'Loan Amortization Calculator',
    shortName: 'Amortization',
    category: 'loan',
    categoryLabel: 'Payoff Strategy · Extra Payments',
    description:
      'Use the loan amortization calculator to build a monthly payoff schedule and estimate how extra principal payments affect your payoff date and interest.',
    shortDescription:
      'Simulate extra monthly payments, view full amortization tables, and pinpoint your early payoff date.',
    iconName: 'TableProperties',
    highlightLabel: 'Total Interest Saved',
    formulaLatex: 'Balance_m = Balance_{m−1} × (1 + i) − (M + E)',
    formulaSummary:
      'Adding an extra monthly principal payment E reduces the balance faster each period, compounding your interest savings and moving your payoff date forward.',
    formulaVariables: [
      { symbol: 'M', meaning: 'Required base monthly principal & interest payment' },
      { symbol: 'E', meaning: 'Optional extra monthly principal payment' },
      { symbol: 'i', meaning: 'Monthly interest rate' },
      { symbol: 'Balance_m', meaning: 'Remaining principal after month m' },
    ],
    faqs: [
      {
        question: 'Do extra monthly payments reduce my required monthly payment?',
        answer:
          'No. Extra payments keep your contractual monthly obligation the same while directly reducing principal, which eliminates future months from the back end of the schedule.',
      },
      {
        question: 'Should I confirm there is no prepayment penalty?',
        answer:
          'Yes. Most residential mortgages and federal student loans allow penalty-free principal prepayments, though some auto or commercial loans include prepayment clauses.',
      },
      {
        question: 'Can I export the amortization schedule?',
        answer:
          'Yes. Use the Export CSV button above the schedule table to download every monthly row for spreadsheet analysis.',
      },
    ],
    relatedSlugs: ['loan-calculator', 'loan-payment-calculator', 'loan-interest-calculator'],
  },
  {
    slug: 'auto-loan-calculator',
    path: '/calculators/auto-loan-calculator',
    name: 'Auto Loan Calculator',
    shortName: 'Auto Loan',
    category: 'auto-credit',
    categoryLabel: 'Vehicle Financing · Dealership Math',
    description:
      'Use this auto finance calculator to estimate monthly car loan payments and total interest. Compare rates, down payments and terms for new or used cars.',
    shortDescription:
      'Factor car price, down payment, APR, and term to see net financed principal and monthly payments.',
    iconName: 'Car',
    highlightLabel: 'Monthly Auto Payment',
    formulaLatex: 'P = Vehicle Price − Down Payment',
    formulaSummary:
      'Your down payment lowers the financed principal P upfront before applying standard monthly installment amortization over the chosen auto term.',
    formulaVariables: [
      { symbol: 'P', meaning: 'Net financed loan amount after down payment' },
      { symbol: 'Down Payment', meaning: 'Upfront cash or net trade-in equity applied' },
      { symbol: 'Total Cost', meaning: 'Down payment + total loan principal + total interest' },
    ],
    faqs: [
      {
        question: 'Can I use this calculator for a used car loan?',
        answer:
          'Yes. Enter the used car price, down payment, annual interest rate and loan term. Use the rate from your financing offer, then vary the rate to compare monthly payments and total interest.',
      },
      {
        question: 'How does a longer car loan term affect the cost?',
        answer:
          'At the same positive interest rate and loan amount, a longer term usually lowers each monthly payment and increases total interest. Compare two terms with the other inputs held constant.',
      },
      {
        question: 'Does this include sales tax or registration fees?',
        answer:
          'If you plan to roll dealer fees or taxes into your loan, simply add them to the Car Price field or subtract them from your Down Payment.',
      },
    ],
    relatedSlugs: ['loan-calculator', 'loan-interest-calculator', 'loan-payment-calculator'],
  },
  {
    slug: 'heloc-calculator',
    path: '/calculators/heloc-calculator',
    name: 'HELOC Calculator',
    shortName: 'HELOC',
    category: 'auto-credit',
    categoryLabel: 'Home Equity · Credit Line',
    description:
      'Estimate monthly payments on a home equity line of credit with the HELOC calculator. Compare interest-only payments with principal-and-interest repayment.',
    shortDescription:
      'Compare Interest-Only draw payments versus Full Principal + Interest payoff for your HELOC balance.',
    iconName: 'Home',
    highlightLabel: 'Monthly HELOC Payment',
    formulaLatex: 'IO = B × i   vs.   P&I = B × [i(1+i)^n] / [(1+i)^n − 1]',
    formulaSummary:
      'Interest-Only payments cover monthly interest charges while leaving the balance unchanged; Full P&I payments amortize both balance and interest to zero.',
    formulaVariables: [
      { symbol: 'B', meaning: 'Drawn HELOC credit line balance' },
      { symbol: 'i', meaning: 'Monthly variable or fixed interest rate' },
      { symbol: 'IO', meaning: 'Interest-only monthly payment during draw phase' },
      { symbol: 'P&I', meaning: 'Amortizing monthly payment during repayment phase' },
    ],
    faqs: [
      {
        question: 'What happens when an Interest-Only HELOC draw period ends?',
        answer:
          'Once the draw period closes, the remaining principal balance enters the repayment phase where full principal + interest payments are required, causing monthly payments to jump.',
      },
      {
        question: 'Why does Total Repayment under Interest-Only include the credit balance?',
        answer:
          'Because interest-only payments do not reduce principal, you still owe the full drawn balance at the end of the period in addition to all interest paid.',
      },
      {
        question: 'How is a HELOC different from a home equity loan?',
        answer:
          'A home equity loan pays out a lump sum. A HELOC lets you draw from an available credit limit over time. Use this calculator to estimate payments on the amount drawn on a HELOC.',
      },
      {
        question: 'Are HELOC interest rates fixed or variable?',
        answer:
          'Most HELOCs carry variable rates tied to the Prime Rate, though many lenders let you lock portions at a fixed rate.',
      },
    ],
    relatedSlugs: ['loan-amortization-calculator', 'loan-interest-calculator', 'loan-calculator'],
  },
  {
    slug: 'compound-interest-calculator',
    path: '/calculators/compound-interest-calculator',
    name: 'Compound Interest Calculator',
    shortName: 'Compound Interest',
    category: 'investment',
    categoryLabel: 'Wealth Growth · Compounding',
    description:
      'Project long-term investment growth by combining initial capital, recurring monthly contributions, expected annual return, and monthly compounding.',
    shortDescription:
      'Model future portfolio value, total contributions, and compounding interest growth over decades.',
    iconName: 'TrendingUp',
    highlightLabel: 'Projected Future Value',
    formulaLatex: 'FV = P₀(1 + i)^n + C × [ ((1 + i)^n − 1) / i ]',
    formulaSummary:
      'Combines compounded growth on your initial lump sum with the future value of recurring monthly contributions compounded monthly.',
    formulaVariables: [
      { symbol: 'FV', meaning: 'Projected future portfolio value' },
      { symbol: 'P₀', meaning: 'Initial investment amount' },
      { symbol: 'C', meaning: 'Consistent monthly contribution' },
      { symbol: 'i', meaning: 'Monthly rate of return (Annual Return ÷ 12 ÷ 100)' },
    ],
    faqs: [
      {
        question: 'Why does compounding accelerate dramatically in later years?',
        answer:
          'In later years, your portfolio earns returns not only on your contributions, but also on decades of previously accumulated interest—creating exponential growth.',
      },
      {
        question: 'How often does this calculator compound returns?',
        answer:
          'It models monthly compounding alongside end-of-month contributions, matching standard brokerage, retirement account, and index fund modeling.',
      },
      {
        question: 'Should I adjust the annual return for inflation?',
        answer:
          'To estimate future purchasing power in today’s dollars, subtract expected inflation (around 2.5%–3%) from your nominal expected return.',
      },
    ],
    relatedSlugs: ['loan-amortization-calculator', 'loan-interest-calculator', 'loan-calculator'],
  },
];

export function getCalculatorBySlug(slug: string): CalculatorMeta | undefined {
  return CALCULATORS_META.find((c) => c.slug === slug);
}
