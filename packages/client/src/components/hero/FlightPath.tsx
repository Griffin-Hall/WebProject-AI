import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface City {
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

// Sample cities positioned roughly on a world map
const CITIES: City[] = [
  { name: 'New York', x: 25, y: 35 },
  { name: 'London', x: 48, y: 28 },
  { name: 'Paris', x: 49, y: 30 },
  { name: 'Tokyo', x: 85, y: 38 },
  { name: 'Sydney', x: 88, y: 75 },
  { name: 'Rio', x: 32, y: 70 },
  { name: 'Cape Town', x: 53, y: 78 },
  { name: 'Dubai', x: 62, y: 42 },
  { name: 'Singapore', x: 78, y: 55 },
  { name: 'San Francisco', x: 18, y: 38 },
  { name: 'Reykjavik', x: 42, y: 18 },
  { name: 'Mumbai', x: 68, y: 48 },
  { name: 'Bangkok', x: 76, y: 50 },
  { name: 'Cairo', x: 55, y: 40 },
  { name: 'Lima', x: 28, y: 62 },
];

/**
 * Flight Path Animation
 * 
 * Shows a subtle animated line traveling between random destinations.
 * Creates a "live" feeling without being distracting.
 * Respects reduced-motion preferences.
 */
export function FlightPath() {
  const [currentRoute, setCurrentRoute] = useState<{ from: City; to: City } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Start with a random route
    pickNewRoute();

    // Set up interval to change routes
    const interval = setInterval(() => {
      if (!isAnimating) {
        pickNewRoute();
      }
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isAnimating]);

  const pickNewRoute = () => {
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    let to = CITIES[Math.floor(Math.random() * CITIES.length)];
    
    // Ensure we don't pick the same city
    while (to.name === from.name) {
      to = CITIES[Math.floor(Math.random() * CITIES.length)];
    }

    setCurrentRoute({ from, to });
    setIsAnimating(true);

    // Reset after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 6000);
  };

  if (prefersReducedMotion || !currentRoute) {
    return null;
  }

  const { from, to } = currentRoute;

  // Calculate path for a curved line (great circle approximation)
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 10; // Curve upward

  const pathD = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  const pathLength = useMemo(() => {
    // Approximate path length for animation
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy) * 2;
  }, [from, to]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.15 }}
      >
        <defs>
          {/* Gradient for the path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3377ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
            <stop offset="100%" stopColor="#3377ff" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <AnimatePresence mode="wait">
          <motion.g
            key={`${from.name}-${to.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Background path (dim) */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="0.3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />

            {/* Animated traveling dot */}
            <motion.circle
              r="0.8"
              fill="#A855F7"
              filter="url(#glow)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                opacity: { times: [0, 0.1, 0.9, 1], duration: 5 },
                offsetDistance: { duration: 5, ease: 'easeInOut' },
              }}
              style={{
                offsetPath: `path('${pathD}')`,
              }}
            />

            {/* Destination markers */}
            <motion.circle
              cx={from.x}
              cy={from.y}
              r="0.5"
              fill="#3377ff"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
            <motion.circle
              cx={to.x}
              cy={to.y}
              r="0.5"
              fill="#A855F7"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ delay: 4.5, duration: 0.5 }}
            />

            {/* Pulsing rings at destinations */}
            <motion.circle
              cx={from.x}
              cy={from.y}
              r="1"
              fill="none"
              stroke="#3377ff"
              strokeWidth="0.2"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: 1 }}
            />
            <motion.circle
              cx={to.x}
              cy={to.y}
              r="1"
              fill="none"
              stroke="#A855F7"
              strokeWidth="0.2"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ delay: 4, duration: 2 }}
            />
          </motion.g>
        </AnimatePresence>
      </svg>
    </div>
  );
}
