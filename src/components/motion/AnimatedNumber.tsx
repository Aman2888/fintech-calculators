import { useEffect, useState } from 'react';
import { useReducedMotion, useSpring } from 'motion/react';
import { useCurrency } from '../../context/CurrencyContext';
import { formatPercent } from '../../lib/format';

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'currency-int' | 'percent' | 'percent-1' | 'integer';
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = 'currency',
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const { formatCurrency } = useCurrency();
  const safeTarget = Number.isFinite(value) ? value : 0;

  const spring = useSpring(safeTarget, {
    stiffness: 240,
    damping: 28,
    mass: 0.6,
  });

  const [displayVal, setDisplayVal] = useState(safeTarget);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayVal(safeTarget);
      return;
    }
    spring.set(safeTarget);
  }, [safeTarget, spring, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayVal(Number.isFinite(latest) ? latest : 0);
    });
    return () => unsubscribe();
  }, [spring, prefersReducedMotion]);

  const formatted = (() => {
    const num = prefersReducedMotion ? safeTarget : displayVal;
    switch (format) {
      case 'currency':
        return formatCurrency(num);
      case 'currency-int':
        return formatCurrency(num, 0);
      case 'percent':
        return formatPercent(num, 2);
      case 'percent-1':
        return formatPercent(num, 1);
      case 'integer':
        return Math.round(num).toLocaleString('en-US');
      default:
        return formatCurrency(num);
    }
  })();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
