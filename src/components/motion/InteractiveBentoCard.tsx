import { type MouseEvent, type ReactNode, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface InteractiveBentoCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function InteractiveBentoCard({
  children,
  className = '',
  index = 0,
}: InteractiveBentoCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 260, damping: 24 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 260, damping: 24 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width);
    const py = (e.clientY - rect.top) / Math.max(1, rect.height);

    rotateY.set((px - 0.5) * 7);
    rotateX.set((0.5 - py) * 7);
    setSpotlight({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setSpotlight((prev) => ({ ...prev, active: false }));
  };

  return (
    <motion.div
      ref={cardRef}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReducedMotion
          ? undefined
          : {
              transformPerspective: 900,
              rotateX: smoothRotateX,
              rotateY: smoothRotateY,
            }
      }
      className={`relative will-change-transform ${className}`}
    >
      {/* Subtle pointer-tracking specular sheen */}
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-10"
          style={{
            opacity: spotlight.active ? 1 : 0,
            background: `radial-gradient(280px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.16), transparent 70%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
