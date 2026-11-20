import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Lock, TrendingUp } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-midnight-mesh min-h-screen text-white">
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-5">
          <div className="text-xs font-semibold text-[#B4F434]">About EasyLoanCalc</div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-balance">
            Money Moves. Made Simple.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            EasyLoanCalc replaces cluttered loan forms with interactive 3D and visual financial
            calculators that reveal exact borrowing costs, amortization timelines, and
            long-term compounding growth.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#B4F434] flex items-center justify-center">
              <Calculator className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              Verified Banking Formulas
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every amortization, HELOC, auto loan, and compound interest tool handles edge
              cases accurately—including 0% APR financing and accelerated principal payoffs.
            </p>
          </div>

          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#38BDF8] flex items-center justify-center">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              Private Client-Side Math
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We never gate calculations behind credit pulls or email forms. Every formula runs
              instantaneously inside your browser session.
            </p>
          </div>

          <div className="bg-[#12142D] rounded-2xl border border-white/12 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#10B981] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              Visual Decision Support
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Interactive charts, printable reports, and CSV amortization exports give you clear
              visibility before committing to any loan or investment.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2563EB] to-[#6366F1] rounded-2xl p-8 sm:p-10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-2xl font-bold">Ready to calculate smarter?</h2>
            <p className="text-sm text-indigo-100">
              Launch any of our seven purpose-built calculators and explore live schedules.
            </p>
          </div>
          <Link
            to="/calculators/loan-calculator"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B4F434] hover:bg-[#a3e635] text-[#090A1A] font-bold text-sm transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Loan Calculator</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
