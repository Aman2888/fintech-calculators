import { addMonthsToDate, formatMonthYear } from './format';

export interface YearlyLoanPoint {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface LoanResult {
  principal: number;
  annualRate: number;
  months: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalSharePercent: number;
  interestSharePercent: number;
  firstMonthPrincipal: number;
  firstMonthInterest: number;
  yearlySchedule: YearlyLoanPoint[];
}

export function calculateStandardLoan(
  principal: number,
  annualRate: number,
  months: number
): LoanResult {
  const safePrincipal = Math.max(0, Number.isFinite(principal) ? principal : 0);
  const safeRate = Math.max(0, Number.isFinite(annualRate) ? annualRate : 0);
  const safeMonths = Math.max(1, Math.round(Number.isFinite(months) ? months : 12));

  const monthlyRate = safeRate / 100 / 12;
  let monthlyPayment = 0;

  if (safePrincipal > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = safePrincipal / safeMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, safeMonths);
      monthlyPayment = (safePrincipal * (monthlyRate * factor)) / (factor - 1);
    }
  }

  let balance = safePrincipal;
  let totalInterest = 0;
  let totalPrincipalPaid = 0;
  let firstMonthPrincipal = 0;
  let firstMonthInterest = 0;

  const yearlySchedule: YearlyLoanPoint[] = [];
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let m = 1; m <= safeMonths; m++) {
    const interest = balance * monthlyRate;
    const rawPrincipal = monthlyPayment - interest;
    const principalPaid = Math.min(balance, Math.max(0, rawPrincipal));
    balance = Math.max(0, balance - principalPaid);

    if (m === 1) {
      firstMonthInterest = interest;
      firstMonthPrincipal = principalPaid;
    }

    totalInterest += interest;
    totalPrincipalPaid += principalPaid;
    yearPrincipal += principalPaid;
    yearInterest += interest;

    if (m % 12 === 0 || m === safeMonths) {
      yearlySchedule.push({
        year: Math.ceil(m / 12),
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remainingBalance: balance,
        cumulativePrincipal: totalPrincipalPaid,
        cumulativeInterest: totalInterest,
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const totalPayment = safePrincipal + totalInterest;
  const principalSharePercent = totalPayment > 0 ? (safePrincipal / totalPayment) * 100 : 100;
  const interestSharePercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return {
    principal: safePrincipal,
    annualRate: safeRate,
    months: safeMonths,
    monthlyPayment,
    totalPayment,
    totalInterest,
    principalSharePercent,
    interestSharePercent,
    firstMonthPrincipal,
    firstMonthInterest,
    yearlySchedule,
  };
}

export interface AmortizationRow {
  month: number;
  dateLabel: string;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  remainingBalance: number;
  cumulativeInterest: number;
}

export interface AmortizationYearlyComparison {
  year: number;
  standardBalance: number;
  acceleratedBalance: number;
  principalPaid: number;
  interestPaid: number;
}

export interface AmortizationResult {
  baseMonthlyPayment: number;
  totalMonthlyPayment: number;
  firstMonthPrincipal: number;
  firstMonthInterest: number;
  standardTotalInterest: number;
  acceleratedTotalInterest: number;
  totalInterestSaved: number;
  standardMonths: number;
  actualMonths: number;
  monthsSaved: number;
  originalPayoffDate: string;
  acceleratedPayoffDate: string;
  totalRepayment: number;
  schedule: AmortizationRow[];
  yearlyComparison: AmortizationYearlyComparison[];
}

export function calculateAmortization(
  principal: number,
  annualRate: number,
  termYears: number,
  extraMonthlyPayment: number,
  startDate = new Date()
): AmortizationResult {
  const safePrincipal = Math.max(0, Number.isFinite(principal) ? principal : 0);
  const safeRate = Math.max(0, Number.isFinite(annualRate) ? annualRate : 0);
  const safeMonths = Math.max(1, Math.round((Number.isFinite(termYears) ? termYears : 1) * 12));
  const safeExtra = Math.max(0, Number.isFinite(extraMonthlyPayment) ? extraMonthlyPayment : 0);

  const monthlyRate = safeRate / 100 / 12;
  let baseMonthlyPayment = 0;

  if (safePrincipal > 0) {
    if (monthlyRate === 0) {
      baseMonthlyPayment = safePrincipal / safeMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, safeMonths);
      baseMonthlyPayment = (safePrincipal * (monthlyRate * factor)) / (factor - 1);
    }
  }

  // Standard baseline balances by year
  const standardYearlyBalance = new Map<number, number>();
  let stdBal = safePrincipal;
  let standardTotalInterest = 0;

  for (let m = 1; m <= safeMonths; m++) {
    const interest = stdBal * monthlyRate;
    const principalPaid = Math.min(stdBal, Math.max(0, baseMonthlyPayment - interest));
    stdBal = Math.max(0, stdBal - principalPaid);
    standardTotalInterest += interest;
    if (m % 12 === 0 || m === safeMonths) {
      standardYearlyBalance.set(Math.ceil(m / 12), stdBal);
    }
  }

  // Accelerated schedule
  const schedule: AmortizationRow[] = [];
  const accelYearlyMap = new Map<
    number,
    { balance: number; principalPaid: number; interestPaid: number }
  >();

  let accelBal = safePrincipal;
  let acceleratedTotalInterest = 0;
  let firstMonthPrincipal = 0;
  let firstMonthInterest = 0;
  let actualMonths = 0;

  let yPrincipal = 0;
  let yInterest = 0;

  for (let m = 1; m <= safeMonths && accelBal > 0.005; m++) {
    const interest = accelBal * monthlyRate;
    const scheduledPrincipal = Math.max(0, baseMonthlyPayment - interest);
    const desiredPrincipal = scheduledPrincipal + safeExtra;
    const principalPaid = Math.min(accelBal, desiredPrincipal);
    const actualExtra = Math.max(0, principalPaid - Math.min(accelBal, scheduledPrincipal));
    const totalPaidThisMonth = principalPaid + interest;

    accelBal = Math.max(0, accelBal - principalPaid);
    acceleratedTotalInterest += interest;
    actualMonths = m;

    if (m === 1) {
      firstMonthPrincipal = principalPaid;
      firstMonthInterest = interest;
    }

    yPrincipal += principalPaid;
    yInterest += interest;

    schedule.push({
      month: m,
      dateLabel: formatMonthYear(addMonthsToDate(startDate, m)),
      payment: totalPaidThisMonth,
      principal: principalPaid,
      interest,
      extraPayment: actualExtra,
      remainingBalance: accelBal,
      cumulativeInterest: acceleratedTotalInterest,
    });

    const yearIdx = Math.ceil(m / 12);
    if (m % 12 === 0 || accelBal <= 0.005) {
      accelYearlyMap.set(yearIdx, {
        balance: accelBal,
        principalPaid: yPrincipal,
        interestPaid: yInterest,
      });
      yPrincipal = 0;
      yInterest = 0;
    }
  }

  const totalYears = Math.ceil(safeMonths / 12);
  const yearlyComparison: AmortizationYearlyComparison[] = [];

  for (let y = 1; y <= totalYears; y++) {
    const accelEntry = accelYearlyMap.get(y);
    yearlyComparison.push({
      year: y,
      standardBalance: standardYearlyBalance.get(y) ?? 0,
      acceleratedBalance: accelEntry ? accelEntry.balance : 0,
      principalPaid: accelEntry ? accelEntry.principalPaid : 0,
      interestPaid: accelEntry ? accelEntry.interestPaid : 0,
    });
  }

  const totalInterestSaved = Math.max(0, standardTotalInterest - acceleratedTotalInterest);
  const monthsSaved = Math.max(0, safeMonths - actualMonths);

  return {
    baseMonthlyPayment,
    totalMonthlyPayment: safePrincipal > 0 ? baseMonthlyPayment + safeExtra : 0,
    firstMonthPrincipal,
    firstMonthInterest,
    standardTotalInterest,
    acceleratedTotalInterest,
    totalInterestSaved,
    standardMonths: safeMonths,
    actualMonths,
    monthsSaved,
    originalPayoffDate: formatMonthYear(addMonthsToDate(startDate, safeMonths)),
    acceleratedPayoffDate: formatMonthYear(addMonthsToDate(startDate, actualMonths)),
    totalRepayment: safePrincipal + acceleratedTotalInterest,
    schedule,
    yearlyComparison,
  };
}

export interface AutoLoanResult extends LoanResult {
  carPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  totalVehicleCost: number;
}

export function calculateAutoLoan(
  carPrice: number,
  downPayment: number,
  annualRate: number,
  termYears: number
): AutoLoanResult {
  const safePrice = Math.max(0, Number.isFinite(carPrice) ? carPrice : 0);
  const safeDown = Math.min(safePrice, Math.max(0, Number.isFinite(downPayment) ? downPayment : 0));
  const financedAmount = Math.max(0, safePrice - safeDown);
  const months = Math.max(1, Math.round((Number.isFinite(termYears) ? termYears : 1) * 12));

  const loan = calculateStandardLoan(financedAmount, annualRate, months);
  const downPaymentPercent = safePrice > 0 ? (safeDown / safePrice) * 100 : 0;

  return {
    ...loan,
    carPrice: safePrice,
    downPayment: safeDown,
    downPaymentPercent,
    totalVehicleCost: safeDown + loan.totalPayment,
  };
}

export type HelocPaymentType = 'interest-only' | 'principal-and-interest';

export interface HelocYearlyPoint {
  year: number;
  selectedBalance: number;
  selectedCumulativePaid: number;
  alternativeCumulativePaid: number;
}

export interface HelocResult {
  creditBalance: number;
  annualRate: number;
  durationYears: number;
  paymentType: HelocPaymentType;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  remainingBalanceAtTermEnd: number;
  alternativeMonthlyPayment: number;
  alternativeTotalInterest: number;
  yearlySeries: HelocYearlyPoint[];
}

export function calculateHeloc(
  creditBalance: number,
  annualRate: number,
  durationYears: number,
  paymentType: HelocPaymentType
): HelocResult {
  const safeBalance = Math.max(0, Number.isFinite(creditBalance) ? creditBalance : 0);
  const safeRate = Math.max(0, Number.isFinite(annualRate) ? annualRate : 0);
  const safeYears = Math.max(1, Math.round(Number.isFinite(durationYears) ? durationYears : 1));
  const months = safeYears * 12;

  const interestOnlyMonthly = (safeBalance * safeRate) / 1200;
  const interestOnlyTotalInterest = interestOnlyMonthly * months;
  const interestOnlyTotalRepayment = safeBalance + interestOnlyTotalInterest;

  const amortizing = calculateStandardLoan(safeBalance, safeRate, months);

  const yearlySeries: HelocYearlyPoint[] = [];
  for (let y = 1; y <= safeYears; y++) {
    const amortPoint = amortizing.yearlySchedule[y - 1];
    const ioCumulativePaid = interestOnlyMonthly * y * 12;
    const piCumulativePaid = amortizing.monthlyPayment * y * 12;

    yearlySeries.push({
      year: y,
      selectedBalance:
        paymentType === 'interest-only'
          ? safeBalance
          : amortPoint
          ? amortPoint.remainingBalance
          : 0,
      selectedCumulativePaid:
        paymentType === 'interest-only' ? ioCumulativePaid : piCumulativePaid,
      alternativeCumulativePaid:
        paymentType === 'interest-only' ? piCumulativePaid : ioCumulativePaid,
    });
  }

  if (paymentType === 'interest-only') {
    return {
      creditBalance: safeBalance,
      annualRate: safeRate,
      durationYears: safeYears,
      paymentType,
      monthlyPayment: interestOnlyMonthly,
      totalInterest: interestOnlyTotalInterest,
      totalRepayment: interestOnlyTotalRepayment,
      remainingBalanceAtTermEnd: safeBalance,
      alternativeMonthlyPayment: amortizing.monthlyPayment,
      alternativeTotalInterest: amortizing.totalInterest,
      yearlySeries,
    };
  }

  return {
    creditBalance: safeBalance,
    annualRate: safeRate,
    durationYears: safeYears,
    paymentType,
    monthlyPayment: amortizing.monthlyPayment,
    totalInterest: amortizing.totalInterest,
    totalRepayment: amortizing.totalPayment,
    remainingBalanceAtTermEnd: 0,
    alternativeMonthlyPayment: interestOnlyMonthly,
    alternativeTotalInterest: interestOnlyTotalInterest,
    yearlySeries,
  };
}

export interface CompoundYearlyPoint {
  year: number;
  totalValue: number;
  totalInvested: number;
  interestEarned: number;
  yearlyContribution: number;
  yearlyInterest: number;
}

export interface CompoundInterestResult {
  initialInvestment: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
  futureValue: number;
  totalInvested: number;
  totalInterestEarned: number;
  growthPercent: number;
  principalSharePercent: number;
  interestSharePercent: number;
  yearlySeries: CompoundYearlyPoint[];
}

export function calculateCompoundInterest(
  initialInvestment: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): CompoundInterestResult {
  const safeInitial = Math.max(0, Number.isFinite(initialInvestment) ? initialInvestment : 0);
  const safeMonthly = Math.max(0, Number.isFinite(monthlyContribution) ? monthlyContribution : 0);
  const safeRate = Math.max(0, Number.isFinite(annualRate) ? annualRate : 0);
  const safeYears = Math.max(1, Math.round(Number.isFinite(years) ? years : 1));

  const monthlyRate = safeRate / 100 / 12;
  let balance = safeInitial;
  let invested = safeInitial;

  const yearlySeries: CompoundYearlyPoint[] = [
    {
      year: 0,
      totalValue: safeInitial,
      totalInvested: safeInitial,
      interestEarned: 0,
      yearlyContribution: 0,
      yearlyInterest: 0,
    },
  ];

  for (let y = 1; y <= safeYears; y++) {
    let yearContrib = 0;
    let yearInterest = 0;
    for (let m = 1; m <= 12; m++) {
      const interest = balance * monthlyRate;
      balance += interest + safeMonthly;
      invested += safeMonthly;
      yearContrib += safeMonthly;
      yearInterest += interest;
    }

    yearlySeries.push({
      year: y,
      totalValue: balance,
      totalInvested: invested,
      interestEarned: Math.max(0, balance - invested),
      yearlyContribution: yearContrib,
      yearlyInterest: yearInterest,
    });
  }

  const totalInterestEarned = Math.max(0, balance - invested);
  const growthPercent = invested > 0 ? (totalInterestEarned / invested) * 100 : 0;
  const principalSharePercent = balance > 0 ? (invested / balance) * 100 : 100;
  const interestSharePercent = balance > 0 ? (totalInterestEarned / balance) * 100 : 0;

  return {
    initialInvestment: safeInitial,
    monthlyContribution: safeMonthly,
    annualRate: safeRate,
    years: safeYears,
    futureValue: balance,
    totalInvested: invested,
    totalInterestEarned,
    growthPercent,
    principalSharePercent,
    interestSharePercent,
    yearlySeries,
  };
}
