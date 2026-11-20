import { calculateAmortization, calculateAutoLoan, calculateCompoundInterest, calculateHeloc, calculateStandardLoan } from '../lib/calculators';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const loan = calculateStandardLoan(10000, 6, 36);
const payoff = calculateAmortization(20000, 6, 5, 100);
const auto = calculateAutoLoan(30000, 5000, 6, 5);
const heloc = calculateHeloc(50000, 8, 10, 'interest-only');
const savings = calculateCompoundInterest(10000, 200, 5, 10);

export const calculatorExamples: Record<string, string> = {
  'loan-calculator': `A $10,000 fixed-rate loan at 6% over 36 months costs ${usd.format(loan.monthlyPayment)} per month. Total repayment is ${usd.format(loan.totalPayment)}, excluding fees.`,
  'loan-payment-calculator': `For a $10,000 loan at 6% over 36 months, the first ${usd.format(loan.monthlyPayment)} payment includes ${usd.format(loan.firstMonthInterest)} in interest and ${usd.format(loan.firstMonthPrincipal)} in principal. The interest portion falls as the balance declines.`,
  'loan-interest-calculator': `A $10,000 loan at 6% over 36 months accrues ${usd.format(loan.totalInterest)} in total interest. The estimate assumes all payments are made on schedule and excludes fees.`,
  'loan-amortization-calculator': `On a $20,000 loan at 6% over five years, paying an extra $100 toward principal each month saves ${usd.format(payoff.totalInterestSaved)} and shortens repayment by ${payoff.monthsSaved} months, assuming the lender applies the extra amount to principal without penalty.`,
  'auto-loan-calculator': `A $30,000 vehicle with a $5,000 down payment leaves $25,000 to finance. At 6% over five years, the estimated payment is ${usd.format(auto.monthlyPayment)} per month before taxes and fees.`,
  'heloc-calculator': `A $50,000 HELOC balance at 8% costs ${usd.format(heloc.monthlyPayment)} per month in interest-only mode. Paying principal and interest over ten years at the same rate costs ${usd.format(heloc.alternativeMonthlyPayment)} per month. The interest-only payments leave the $50,000 balance outstanding.`,
  'compound-interest-calculator': `Start with $10,000, contribute $200 at the end of each month and assume a constant 5% annual rate compounded monthly. After ten years, the projected balance is ${usd.format(savings.futureValue)}, before taxes, fees and inflation.`,
};
