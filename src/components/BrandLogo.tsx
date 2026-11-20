import { Link } from 'react-router-dom';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="EasyLoanCalc home"
      className="inline-flex shrink-0 items-center gap-2 rounded-md font-display text-lg font-extrabold tracking-tight text-white sm:text-xl"
    >
      <img
        src="/assets/easyloancalc-mark.svg"
        width="32"
        height="32"
        alt=""
        className="size-8 shrink-0"
      />
      <span aria-hidden="true" className={compact ? 'max-[380px]:sr-only' : undefined}>
        EasyLoan<span className="text-[#B4F434]">Calc</span>
      </span>
    </Link>
  );
}
