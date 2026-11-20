import { Link } from 'react-router-dom';
import { CALCULATORS_META } from '../data/calculatorsMeta';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070815] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* Bold Expressive Statement Band from Design */}
        <div className="pb-12 mb-12 border-b border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#B4F434]">
              Financial Clarity Suite
            </div>
            <div className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Creative Financial Tools.
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Built for borrowers, car buyers, homeowners, and investors who want transparent
            formulas, real-time charts, and zero guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Contact */}
          <div className="md:col-span-4 space-y-4">
            <Link
              to="/"
              className="font-display text-xl font-extrabold tracking-tight text-white inline-block"
            >
              CALCULATE
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Money Moves. Made Simple. Instant client-side calculations for loans,
              amortization, auto financing, HELOCs, and compounding wealth.
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <div>support@calculate.app</div>
              <div>San Francisco, CA · Educational Financial Suite</div>
            </div>
          </div>

          {/* Calculator Links */}
          <div className="md:col-span-4">
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              All 7 Calculators
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5 text-sm">
              {CALCULATORS_META.map((calc) => (
                <li key={calc.slug}>
                  <Link
                    to={calc.path}
                    className="text-slate-400 hover:text-[#B4F434] transition-colors"
                  >
                    {calc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} CALCULATE Financial Tools. All rights reserved.</p>
          <p className="text-slate-500">
            Estimates are for educational planning and do not constitute financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
