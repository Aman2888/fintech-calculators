import { motion, useReducedMotion } from 'motion/react';

export function AtmosphericBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 right-[-10%] w-[520px] h-[520px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-32 left-[-8%] w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        animate={{
          x: [0, 24, -12, 0],
          y: [0, -18, 12, 0],
          scale: [1, 1.06, 0.97, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-28 right-[-8%] w-[560px] h-[560px] rounded-full bg-[#6366F1]/18 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -20, 16, 0],
          y: [0, 20, -10, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-36 left-[-6%] w-[480px] h-[480px] rounded-full bg-[#10B981]/12 blur-3xl"
      />
      <motion.div
        animate={{
          opacity: [0.06, 0.14, 0.06],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[380px] h-[220px] rounded-full bg-[#B4F434]/10 blur-3xl"
      />
    </div>
  );
}
