import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  size: number;
  x: string;
  y: string;
  delay: string;
  duration: string;
  opacity: number;
}

/**
 * Generate random particles for the background
 */
function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1, // 1-3px
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${Math.random() * 10 + 15}s`, // 15-25s for slower, gentler motion
    opacity: Math.random() * 0.08 + 0.02, // Very low opacity (0.02-0.10)
  }));
}

/**
 * Floating Particles Background
 * 
 * Creates a subtle, ambient particle effect in the hero section.
 * Respects prefers-reduced-motion media query.
 * 
 * Features:
 * - Very low opacity for non-distracting effect
 * - Slow, gentle floating motion
 * - Random distribution across viewport
 * - Respects reduced-motion preference
 */
export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    // Generate particles only if motion is not reduced
    if (!mediaQuery.matches) {
      setParticles(generateParticles(25)); // 25 subtle particles
    }

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Don't render if user prefers reduced motion
  if (prefersReducedMotion || particles.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none" 
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
            // Use CSS custom properties for animation if needed
            ['--float-x' as string]: `${(Math.random() - 0.5) * 30}px`,
            ['--float-y' as string]: `${(Math.random() - 0.5) * 30}px`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Static particles for reduced-motion mode
 * Shows subtle dots without animation
 */
export function StaticParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(15));
  }, []);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none" 
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            opacity: p.opacity * 0.5, // Even more subtle for static
          }}
        />
      ))}
    </div>
  );
}

export default FloatingParticles;
