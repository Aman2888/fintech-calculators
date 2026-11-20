import {
  Calculator,
  Car,
  Home,
  Percent,
  TableProperties,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { CalculatorMeta } from '../data/calculatorsMeta';

interface CalculatorIconProps {
  name: CalculatorMeta['iconName'];
  className?: string;
}

export function CalculatorIcon({ name, className = 'w-5 h-5' }: CalculatorIconProps) {
  switch (name) {
    case 'Calculator':
      return <Calculator className={className} aria-hidden="true" />;
    case 'Wallet':
      return <Wallet className={className} aria-hidden="true" />;
    case 'Percent':
      return <Percent className={className} aria-hidden="true" />;
    case 'TableProperties':
      return <TableProperties className={className} aria-hidden="true" />;
    case 'Car':
      return <Car className={className} aria-hidden="true" />;
    case 'Home':
      return <Home className={className} aria-hidden="true" />;
    case 'TrendingUp':
      return <TrendingUp className={className} aria-hidden="true" />;
    default:
      return <Calculator className={className} aria-hidden="true" />;
  }
}
