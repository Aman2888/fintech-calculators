import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { CurrencyProvider } from './context/CurrencyContext';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
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
        initial={{ opacity: 0, y: 8 }}
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage mode="privacy" />} />
          <Route path="/terms" element={<LegalPage mode="terms" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#090A1A] text-white">
            <Navbar />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CurrencyProvider>
    </MotionConfig>
  );
}
