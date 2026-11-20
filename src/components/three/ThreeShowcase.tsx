import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ThreeShowcaseProps } from './ThreeScene';

const ThreeScene = lazy(() => import('./ThreeScene').then(({ ThreeScene }) => ({ default: ThreeScene })));

export function ThreeShowcase({ className = 'w-full h-72 sm:h-80', ...props }: ThreeShowcaseProps) {
  const container = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className={className} aria-hidden="true">
      {nearViewport && (
        <Suspense fallback={null}>
          <ThreeScene {...props} className="h-full w-full" />
        </Suspense>
      )}
    </div>
  );
}
