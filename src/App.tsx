import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { PageSeo } from './components/PageSeo';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { CurrencyProvider } from './context/CurrencyContext';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GuidesPage } from './pages/GuidesPage';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';
import { AutoLoanCalculatorPage } from './pages/calculators/AutoLoanCalculatorPage';
import { CompoundInterestCalculatorPage } from './pages/calculators/CompoundInterestCalculatorPage';
import { HelocCalculatorPage } from './pages/calculators/HelocCalculatorPage';
import { LoanAmortizationCalculatorPage } from './pages/calculators/LoanAmortizationCalculatorPage';
import { LoanCalculatorPage } from './pages/calculators/LoanCalculatorPage';
import { LoanInterestCalculatorPage } from './pages/calculators/LoanInterestCalculatorPage';
import { LoanPaymentCalculatorPage } from './pages/calculators/LoanPaymentCalculatorPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculators/loan-calculator" element={<LoanCalculatorPage />} />
          <Route
            path="/calculators/loan-payment-calculator"
            element={<LoanPaymentCalculatorPage />}
          />
          <Route
            path="/calculators/loan-interest-calculator"
            element={<LoanInterestCalculatorPage />}
          />
          <Route
            path="/calculators/loan-amortization-calculator"
            element={<LoanAmortizationCalculatorPage />}
          />
          <Route
            path="/calculators/auto-loan-calculator"
            element={<AutoLoanCalculatorPage />}
          />
          <Route path="/calculators/heloc-calculator" element={<HelocCalculatorPage />} />
          <Route
            path="/calculators/compound-interest-calculator"
            element={<CompoundInterestCalculatorPage />}
          />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage mode="privacy" />} />
          <Route path="/terms" element={<LegalPage mode="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-slate-300">That address does not point to a EasyLoanCalc page.</p>
      <Link to="/#calculators" className="mt-5 inline-block text-[#B4F434] underline">
        Browse financial calculators
      </Link>
    </section>
  );
}

export function AppContent() {
  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider>
        <PageSeo />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#090A1A] text-white">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-[#090A1A] focus:p-3">
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </CurrencyProvider>
    </MotionConfig>
  );
}

export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}
