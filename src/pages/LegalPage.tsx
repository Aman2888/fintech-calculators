import { Link } from 'react-router-dom';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
}

export function LegalPage({ mode }: LegalPageProps) {
  const isPrivacy = mode === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div className="bg-midnight-mesh min-h-screen py-14 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12142D] rounded-2xl border border-white/12 p-8 sm:p-10 space-y-6">
          <div className="border-b border-white/10 pb-5">
            <div className="text-xs font-semibold text-[#B4F434] mb-1">EasyLoanCalc Legal</div>
            <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: November 2026</p>
          </div>

          {isPrivacy ? (
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                EasyLoanCalc performs all loan, amortization, HELOC, auto loan, and compound
                interest calculations directly inside your web browser. Numerical inputs you
                enter are never transmitted to or stored on external servers.
              </p>
              <h2 className="font-display text-base font-bold text-white pt-2">
                1. Voluntary Inquiries
              </h2>
              <p>
                If you submit a support note via our Contact page, we collect only the name,
                email address, and message content you choose to share in order to respond.
              </p>
              <h2 className="font-display text-base font-bold text-white pt-2">
                2. Zero Credit Pulls
              </h2>
              <p>
                EasyLoanCalc never requests bank credentials or credit bureau reports and does not
                sell user data to third-party lenders.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                EasyLoanCalc provides interactive financial calculators strictly for informational
                and educational planning purposes. Results are mathematical estimates based on
                your inputs.
              </p>
              <h2 className="font-display text-base font-bold text-white pt-2">
                1. Not Financial or Legal Advice
              </h2>
              <p>
                Calculations do not constitute personalized financial, tax, investment, or legal
                advice. Actual lender terms may include closing costs, taxes, or variable rate
                adjustments.
              </p>
              <h2 className="font-display text-base font-bold text-white pt-2">
                2. Verification
              </h2>
              <p>
                Confirm final repayment schedules with a licensed financial institution before
                executing binding credit agreements.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <Link
              to="/"
              className="text-sm font-semibold text-[#B4F434] hover:text-white transition-colors"
            >
              ← Return to EasyLoanCalc Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
