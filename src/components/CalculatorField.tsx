import { type CSSProperties, useState } from 'react';
import type { FieldError, FieldValues, Path, UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface CalculatorFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  value: number;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  min: number;
  max: number;
  step?: number;
  sliderMax?: number;
  prefix?: string;
  suffix?: string;
  minLabel?: string;
  maxLabel?: string;
  helperText?: string;
  validate?: (val: number) => string | true;
  theme?: 'dark' | 'light';
  accentColor?: string;
}

export function CalculatorField<T extends FieldValues>({
  name,
  label,
  value,
  register,
  setValue,
  error,
  min,
  max,
  step = 1,
  sliderMax,
  prefix,
  suffix,
  minLabel,
  maxLabel,
  helperText,
  validate,
  theme = 'dark',
  accentColor = '#B4F434',
}: CalculatorFieldProps<T>) {
  const [isScrubbing, setIsScrubbing] = useState(false);

  const effectiveSliderMax = sliderMax ?? max;
  const clampedValue = Number.isFinite(value)
    ? Math.min(effectiveSliderMax, Math.max(min, value))
    : min;
  const progressPct =
    effectiveSliderMax > min
      ? ((clampedValue - min) / (effectiveSliderMax - min)) * 100
      : 0;

  const inputId = `field-${String(name)}`;
  const sliderId = `slider-${String(name)}`;

  const registered = register(name, {
    valueAsNumber: true,
    required: `${label} is required`,
    min: { value: min, message: `${label} must be at least ${min}` },
    max: { value: max, message: `${label} cannot exceed ${max.toLocaleString()}` },
    validate: (v) => {
      if (Number.isNaN(v)) return `Enter a valid number for ${label}`;
      return validate ? validate(v) : true;
    },
  });

  const isDark = theme === 'dark';
  const trackBg = isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0';
  const sliderStyle: CSSProperties & Record<string, string> = {
    background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${progressPct}%, ${trackBg} ${progressPct}%, ${trackBg} 100%)`,
    '--slider-thumb': accentColor,
    '--slider-ring': isDark ? '#0B0C1E' : '#FFFFFF',
  };

  return (
    <div className="space-y-2.5 group">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className={`text-sm font-medium select-none transition-colors ${
            isDark ? 'text-slate-200' : 'text-[#14213D]'
          }`}
        >
          {label}
        </label>
        {helperText && (
          <span
            className={`text-xs transition-opacity ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {helperText}
          </span>
        )}
      </div>

      <div
        className={`relative flex items-center rounded-xl border transition-all duration-150 ${
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
            : isScrubbing
            ? isDark
              ? 'bg-white/10 border-white/45 shadow-[0_0_0_3px_rgba(255,255,255,0.06)]'
              : 'bg-white border-[#14213D] shadow-[0_0_0_3px_rgba(37,99,235,0.10)]'
            : isDark
            ? 'bg-white/5 border-white/12 hover:border-white/25 focus-within:border-white/50'
            : 'bg-white border-slate-200 hover:border-slate-300 focus-within:border-[#14213D]'
        }`}
      >
        {prefix && (
          <span
            className={`pl-3.5 pr-1 text-sm font-mono font-medium select-none whitespace-nowrap shrink-0 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type="number"
          step={step}
          min={min}
          max={max}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full py-2.5 bg-transparent font-mono text-base font-medium tabular-nums focus:outline-none ${
            isDark ? 'text-white' : 'text-[#14213D]'
          } ${prefix ? 'pl-1' : 'pl-3.5'} ${suffix ? 'pr-2' : 'pr-3.5'}`}
          {...registered}
        />
        {suffix && (
          <span
            className={`pr-3.5 pl-1 text-xs font-medium select-none whitespace-nowrap ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {suffix}
          </span>
        )}
      </div>

      <div className="pt-0.5 space-y-1">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={effectiveSliderMax}
          step={step}
          value={clampedValue}
          aria-label={`${label} slider`}
          onPointerDown={() => setIsScrubbing(true)}
          onPointerUp={() => setIsScrubbing(false)}
          onBlur={() => setIsScrubbing(false)}
          onChange={(e) => {
            const nextVal = parseFloat(e.target.value);
            setValue(name, nextVal as never, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          style={sliderStyle}
          className="w-full calc-slider"
        />
        <div
          className={`flex items-center justify-between text-[11px] font-mono tabular-nums ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <span>{minLabel ?? min}</span>
          <span>{maxLabel ?? effectiveSliderMax.toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
