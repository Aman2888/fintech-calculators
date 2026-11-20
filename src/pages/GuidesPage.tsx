import { Link } from 'react-router-dom';
import { calculatorExamples } from '../data/calculatorExamples';

export function GuidesPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-10 px-6 py-14 text-slate-300">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-bold text-white">How to Compare Loans and Savings</h1>
        <p>Use the same assumptions across scenarios. Start with a monthly payment or savings estimate, then change one input at a time to see how it affects the total.</p>
      </header>
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold text-white">Compare monthly payments and total interest</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Enter the amount financed, annual rate and term in the <Link className="underline" to="/calculators/loan-calculator">fixed-rate loan calculator</Link>.</li>
          <li>Compare total interest alongside the monthly payment. A longer term can reduce what you pay each month while increasing what you pay overall.</li>
          <li>Use the <Link className="underline" to="/calculators/loan-amortization-calculator">amortization calculator</Link> to see how an extra principal payment changes the payoff date.</li>
        </ol>
        <p>{calculatorExamples['loan-amortization-calculator']}</p>
      </section>
      <section id="car-loans" className="scroll-mt-24 space-y-3">
        <h2 className="font-display text-2xl font-semibold text-white">Compare new and used car finance rates</h2>
        <p>Enter the vehicle price, down payment and annual interest rate from each offer in the <Link className="underline" to="/calculators/auto-loan-calculator">vehicle finance calculator</Link>. Start with the same amount and term so you can see how the rates affect monthly payments and total interest. For a used car, ask whether the quote applies to that vehicle.</p>
        <h3 className="font-display text-lg font-semibold text-white">What to compare after auto loan preapproval</h3>
        <p>When comparing auto finance offers, check the quoted APR, loan term and total cost. Use the contract interest rate to estimate the payment and compare APR separately, since APR can reflect fees. Include any fees you plan to finance in the vehicle price you enter.</p>
        <p>{calculatorExamples['auto-loan-calculator']}</p>
        <p><a className="underline" href="https://www.consumerfinance.gov/ask-cfpb/where-can-i-get-information-on-auto-loan-rates-en-761/">CFPB guidance on shopping for auto loan rates</a></p>
      </section>
      <section id="home-equity" className="scroll-mt-24 space-y-3">
        <h2 className="font-display text-2xl font-semibold text-white">Home equity loan vs. HELOC</h2>
        <p>A home equity loan provides a lump sum. A HELOC provides a credit line you can draw from as needed. For a fixed-rate home equity loan with regular principal-and-interest payments, use the <Link className="underline" to="/calculators/loan-calculator">fixed-rate loan calculator</Link>.</p>
        <p>Enter the amount drawn and the annual rate in the <Link className="underline" to="/calculators/heloc-calculator">HELOC calculator</Link>. Compare interest-only and principal-and-interest modes. If your line has a variable rate, repeat the estimate with a higher rate to see how your payment could change.</p>
        <p>{calculatorExamples['heloc-calculator']}</p>
        <p><a className="underline" href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-home-equity-loan-and-a-home-equity-line-of-credit-heloc-en-247/">CFPB comparison of home equity loans and HELOCs</a></p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold text-white">Project savings with monthly contributions</h2>
        <p>In the <Link className="underline" to="/calculators/compound-interest-calculator">compound interest calculator</Link>, enter your starting balance, monthly contribution, assumed rate and time horizon. Compare the projected balance with the total you contributed to see the estimated growth.</p>
        <p>{calculatorExamples['compound-interest-calculator']}</p>
      </section>
    </article>
  );
}
