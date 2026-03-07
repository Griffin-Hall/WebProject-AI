import { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GlobeRef } from './Globe';

// Lazy load the Globe component to reduce initial bundle size
const Globe = lazy(() => import('./Globe'));

interface GlobeLazyProps {
  /** Size of the globe in pixels */
  size?: number;
  /** Auto-rotation speed (0 to disable) */
  autoRotateSpeed?: number;
  /** Allow user interaction */
  interactive?: boolean;
  /** Called when globe is clicked */
  onGlobeClick?: () => void;
  /** Show loading state */
  showLoading?: boolean;
}

/**
 * Lazy-loaded Globe Component
 * 
 * Loads the 3D globe only when it enters the viewport.
 * Shows a stylish loading placeholder while loading.
 * Falls back to static SVG on WebGL failure.
 */
export function GlobeLazy({
  size = 400,
  autoRotateSpeed = 0.5,
  interactive = true,
  onGlobeClick,
  showLoading = true,
}: GlobeLazyProps) {
  const globeRef = useRef<GlobeRef>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to lazy load when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <motion.div
      className="flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative">
        {/* Pulsing gradient ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.3), rgba(168, 213, 162, 0.3))',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Solid circle */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4A90E2] to-[#357ABD]"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Continent shapes */}
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
            <ellipse cx="30" cy="35" rx="15" ry="12" fill="#A8D5A2" />
            <ellipse cx="35" cy="65" rx="12" ry="15" fill="#A8D5A2" />
            <ellipse cx="70" cy="40" rx="18" ry="14" fill="#E6EE9C" />
            <ellipse cx="75" cy="70" rx="10" ry="8" fill="#A8D5A2" />
          </svg>
        </motion.div>
        
        {/* Loading text */}
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading 3D Globe...
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div ref={containerRef} className="relative">
      {isVisible ? (
        <Suspense fallback={showLoading ? <LoadingPlaceholder /> : null}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            onLoad={() => setIsLoaded(true)}
          >
            <Globe
              ref={globeRef}
              size={size}
              autoRotateSpeed={autoRotateSpeed}
              interactive={interactive}
              onGlobeClick={onGlobeClick}
            />
          </motion.div>
        </Suspense>
      ) : (
        showLoading && <LoadingPlaceholder />
      )}
    </div>
  );
}

// Re-export the GlobeRef type for consumers
export type { GlobeRef } from './Globe';

export default GlobeLazy;
