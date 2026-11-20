import { useEffect, useRef } from 'react';
import type { FieldValues, Path, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { useCurrency } from '../context/CurrencyContext';

/**
 * Synchronizes monetary React Hook Form fields whenever the global currency changes,
 * converting monetary amounts via live exchange rates while leaving non-monetary
 * fields (APR, duration, payment mode) untouched.
 */
export function useCurrencySync<T extends FieldValues>(
  monetaryFields: Path<T>[],
  getValues: UseFormGetValues<T>,
  setValue: UseFormSetValue<T>,
  skipInitialRateApply = false
) {
  const { currency, activeRate, getRateFor } = useCurrency();
  const appliedCurrencyRef = useRef<string>(currency);
  const appliedRateRef = useRef<number | null>(activeRate);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Handle initial load when a non-USD currency was restored from localStorage
    // and live rates just arrived after mount.
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (skipInitialRateApply) {
        appliedCurrencyRef.current = currency;
        appliedRateRef.current = activeRate;
        return;
      }
      if (currency !== 'USD' && activeRate !== null) {
        // Default values passed to useForm were already scaled if activeRate was cached;
        // if rates arrived asynchronously, appliedRateRef.current would have been null initially.
        if (appliedRateRef.current === null) {
          for (const field of monetaryFields) {
            const currentVal = Number(getValues(field));
            if (Number.isFinite(currentVal)) {
              setValue(field, Math.round(currentVal * activeRate) as never, {
                shouldValidate: true,
              });
            }
          }
        }
        appliedRateRef.current = activeRate;
      }
      return;
    }

    const prevCurrency = appliedCurrencyRef.current;
    const prevRate = appliedRateRef.current;

    if (prevCurrency === currency) {
      // Same currency: if rates arrived for the first time for a saved non-USD currency,
      // apply the rate once; never overwrite user values on silent background refreshes.
      if (currency !== 'USD' && prevRate === null && activeRate !== null) {
        for (const field of monetaryFields) {
          const currentVal = Number(getValues(field));
          if (Number.isFinite(currentVal)) {
            setValue(field, Math.round(currentVal * activeRate) as never, {
              shouldValidate: true,
            });
          }
        }
        appliedRateRef.current = activeRate;
      }
      return;
    }

    // Currency switched by user!
    const effectivePrevRate = prevRate ?? getRateFor(prevCurrency);
    if (effectivePrevRate !== null && activeRate !== null) {
      const ratio = activeRate / effectivePrevRate;
      for (const field of monetaryFields) {
        const currentVal = Number(getValues(field));
        if (Number.isFinite(currentVal)) {
          const converted = currentVal * ratio;
          const rounded =
            converted >= 100
              ? Math.round(converted)
              : Math.round(converted * 100) / 100;
          setValue(field, rounded as never, { shouldValidate: true });
        }
      }
      appliedRateRef.current = activeRate;
    } else {
      // Exchange rate unavailable: update currency symbol without inventing fake rates
      appliedRateRef.current = activeRate;
    }

    appliedCurrencyRef.current = currency;
  }, [currency, activeRate, getRateFor, getValues, setValue, monetaryFields, skipInitialRateApply]);
}
