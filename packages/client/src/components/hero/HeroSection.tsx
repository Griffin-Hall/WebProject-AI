import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ChevronDown, Compass, Globe2, Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { EXAMPLE_QUERIES } from '@/lib/constants';
import { FloatingParticles } from './FloatingParticles';
import { HeroAmbientOverlay } from './HeroAmbientOverlay';

const SUGGESTION_CHIPS = [
  { label: 'Beach', emoji: '🏖️', color: 'from-cyan-500/20 to-blue-500/20' },
  { label: 'Mountains', emoji: '🏔️', color: 'from-emerald-500/20 to-teal-500/20' },
  { label: 'City Break', emoji: '🌆', color: 'from-indigo-500/20 to-blue-500/20' },
  { label: 'Budget', emoji: '💸', color: 'from-amber-500/20 to-orange-500/20' },
  { label: 'Culture', emoji: '🎭', color: 'from-rose-500/20 to-red-500/20' },
  { label: 'Tropical', emoji: '🌴', color: 'from-green-500/20 to-emerald-500/20' },
];

const FEATURE_PILLS = [
  { icon: Brain, label: 'AI-Powered' },
  { icon: Compass, label: 'Smart Matching' },
  { icon: Globe2, label: '255+ Destinations' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const chipContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.6 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

export function HeroSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [searchActive, setSearchActive] = useState(false);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
      setPointer({ x: normalizedX, y: normalizedY });
    },
    [prefersReducedMotion],
  );

  return (
    <section
      className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden bg-canvas"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPointer({ x: 0, y: 0 })}
    >
      {!prefersReducedMotion && <FloatingParticles />}

      <HeroAmbientOverlay
        reducedMotion={prefersReducedMotion}
        pointerX={pointer.x}
        pointerY={pointer.y}
        searchActive={searchActive}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="ambient-blob ambient-blob-voyage right-[-8%] top-[-15%] h-[32rem] w-[32rem] opacity-30" />
        <div className="ambient-blob ambient-blob-aurora bottom-[-14%] left-[-8%] h-[34rem] w-[34rem] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(45,123,255,0.2)_0%,transparent_52%)]" />
      </div>

      <div className="container-wide relative z-10 w-full">
        <motion.div
          className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8 flex flex-wrap justify-center gap-3">
            {FEATURE_PILLS.map((pill) => (
              <motion.div
                key={pill.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[13px] text-slate-300"
                whileHover={{
                  scale: 1.04,
                  borderColor: 'rgba(59,130,246,0.35)',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                }}
              >
                <pill.icon className="h-3.5 w-3.5 text-voyage-300" />
                {pill.label}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <motion.div
              className="group inline-flex cursor-default items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-5 py-2.5 text-base text-slate-300"
              whileHover={{
                scale: 1.02,
                borderColor: 'rgba(59,130,246,0.4)',
              }}
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        rotate: [0, 16, -16, 0],
                        scale: [1, 1.08, 1.08, 1],
                      }
                }
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-voyage-300" />
              </motion.div>
              <span className="relative">
                AI-powered travel discovery
                <motion.span
                  className="absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-transparent via-voyage-300/70 to-transparent"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                />
              </span>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="font-display text-5xl font-bold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.3rem]">
              <span className="mb-2 block">Where do you</span>
              <span className="gradient-text-animated block">want to go?</span>
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-slate-300 lg:text-xl"
          >
            Describe your dream trip in natural language. Our AI analyzes{' '}
            <span className="text-slate-100">weather patterns</span>,{' '}
            <span className="text-slate-100">budget data</span>,{' '}
            <span className="text-slate-100">safety ratings</span>, and{' '}
            <span className="text-slate-100">local vibes</span> to find your perfect destination.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 w-full max-w-2xl">
            <SearchBar
              variant="hero"
              onActivityChange={setSearchActive}
              onFocusChange={setSearchActive}
            />
          </motion.div>

          <motion.div
            variants={chipContainerVariants}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {SUGGESTION_CHIPS.map((chip) => (
              <motion.div
                key={chip.label}
                variants={chipVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              >
                <Link
                  to={`/search?q=${encodeURIComponent(`${chip.label.toLowerCase()} vacation`)}`}
                  className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-2 text-[15px] font-medium text-slate-300 transition-all duration-300 hover:border-white/[0.24] hover:text-white"
                >
                  <span
                    className={`absolute inset-0 bg-gradient-to-r ${chip.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                    {chip.emoji}
                  </span>
                  <span className="relative z-10">{chip.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span className="text-xs text-slate-500">Try:</span>
            {EXAMPLE_QUERIES.slice(0, 3).map((query) => (
              <Link
                key={query}
                to={`/search?q=${encodeURIComponent(query)}`}
                className="group relative text-xs text-slate-500 transition-colors duration-200 hover:text-voyage-300"
              >
                &ldquo;{query}&rdquo;
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-voyage-300/60 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.button
          className="group flex flex-col items-center gap-1.5"
          animate={prefersReducedMotion ? {} : { y: [0, 7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.82, behavior: 'smooth' })}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-slate-300">
            Discover
          </span>
          <ChevronDown className="h-5 w-5 text-slate-500 transition-colors group-hover:text-voyage-300" />
        </motion.button>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </section>
  );
}

export default HeroSection;
