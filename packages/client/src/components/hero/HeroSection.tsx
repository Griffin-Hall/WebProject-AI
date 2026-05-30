import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  ChevronDown,
  CloudSun,
  Compass,
  Database,
  DollarSign,
  Globe2,
  Landmark,
  MapPin,
  Mountain,
  Plane,
  Route,
  Shield,
  Sparkles,
  Waves,
} from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { EXAMPLE_QUERIES } from '@/lib/constants';
import { GlobeLazy } from './GlobeLazy';
import { HeroAmbientOverlay } from './HeroAmbientOverlay';

const SUGGESTION_CHIPS = [
  {
    label: 'Warm coast',
    query: 'warm beach vacation in July under $120 per day',
    icon: Waves,
    className: 'hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100',
  },
  {
    label: 'Alpine air',
    query: 'cold mountain trip with hiking and views',
    icon: Mountain,
    className: 'hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100',
  },
  {
    label: 'Culture sprint',
    query: 'safe cultural city trip in Europe with museums',
    icon: Landmark,
    className: 'hover:border-coral-light/30 hover:bg-coral/10 hover:text-coral-light',
  },
  {
    label: 'Value escape',
    query: 'budget-friendly trip with great food and warm weather',
    icon: DollarSign,
    className: 'hover:border-amber-300/30 hover:bg-amber-400/10 hover:text-amber-100',
  },
];

const FEATURE_PILLS = [
  { icon: Brain, label: 'Natural-language planning' },
  { icon: Compass, label: 'Ranked destination fit' },
  { icon: Globe2, label: '255+ destination signals' },
];

const HERO_METRICS = [
  { value: '4', label: 'fit dimensions' },
  { value: '12', label: 'monthly climate windows' },
  { value: '3', label: 'budget tiers' },
];

const SIGNALS = [
  { icon: CloudSun, label: 'Climate', value: 'July warmth' },
  { icon: Shield, label: 'Safety', value: 'risk-aware' },
  { icon: Database, label: 'Sources', value: 'verified links' },
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
      className="relative flex min-h-[calc(86svh-4rem)] flex-col justify-center overflow-hidden bg-canvas py-8 sm:min-h-[calc(90svh-4rem)] sm:py-12 lg:min-h-[calc(92svh-4rem)] lg:py-14"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPointer({ x: 0, y: 0 })}
    >

      <HeroAmbientOverlay
        reducedMotion={prefersReducedMotion}
        pointerX={pointer.x}
        pointerY={pointer.y}
        searchActive={searchActive}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,12,28,0.1)_0%,rgba(5,12,28,0.62)_66%,rgb(5,12,28)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-voyage-500/10 to-transparent" />
      </div>

      <div className="container-wide relative z-10 w-full">
        <motion.div
          className="grid min-h-[calc(74svh-4rem)] items-center gap-10 sm:min-h-[calc(78svh-4rem)] lg:min-h-[calc(82svh-4rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative z-20 mx-auto min-w-0 w-full max-w-[calc(100vw-2.5rem)] overflow-hidden text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <motion.div variants={itemVariants} className="mb-7 hidden flex-wrap justify-center gap-2.5 sm:flex lg:justify-start">
              {FEATURE_PILLS.map((pill) => (
                <div
                  key={pill.label}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-3.5 py-2 text-[13px] text-slate-300 backdrop-blur-xl"
                >
                  <pill.icon className="h-3.5 w-3.5 text-voyage-300" />
                  {pill.label}
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sand/15 bg-sand/5 px-4 py-2 text-sm font-medium text-sand-light">
                <Sparkles className="h-3.5 w-3.5" />
                AI travel intelligence engine
              </div>
            </motion.div>

            <div>
              <h1 className="font-display text-4xl font-bold leading-[0.98] text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                Globe<span className="block bg-gradient-to-r from-voyage-200 via-sand-light to-coral-light bg-clip-text text-transparent sm:inline">Sense</span>
              </h1>
            </div>

            <p className="mx-auto mt-6 max-w-[18rem] text-balance text-base leading-relaxed text-slate-300 sm:max-w-2xl sm:text-lg lg:mx-0 lg:text-xl">
              Turn a rough travel idea into ranked destinations with climate fit, budget reality,
              safety context, trip style signals, and source links you can verify.
            </p>

            <div className="mx-auto mt-8 w-full max-w-[19rem] sm:max-w-2xl lg:mx-0 lg:max-w-3xl">
              <SearchBar
                variant="hero"
                onActivityChange={setSearchActive}
                onFocusChange={setSearchActive}
              />
            </div>

            <motion.div
              variants={chipContainerVariants}
              className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              {SUGGESTION_CHIPS.map((chip) => (
                <motion.div
                  key={chip.label}
                  variants={chipVariants}
                  whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                >
                  <Link
                    to={`/search?q=${encodeURIComponent(chip.query)}`}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-3.5 py-2 text-sm font-medium text-slate-300 transition-all duration-300 ${chip.className}`}
                  >
                    <chip.icon className="h-4 w-4" />
                    <span>{chip.label}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 lg:justify-start">
              <span className="text-xs text-slate-500">Example searches</span>
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

            <dl className="mt-8 hidden grid-cols-3 gap-3 border-y border-white/[0.07] py-4 text-left sm:grid">
              {HERO_METRICS.map((metric) => (
                <div key={metric.label}>
                  <dt className="text-[11px] uppercase text-slate-500">{metric.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-white">{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <motion.div
            variants={itemVariants}
            className="relative mx-auto hidden h-[560px] min-w-0 w-full max-w-[35rem] items-center justify-center overflow-visible lg:flex"
          >
            <div className="absolute inset-x-8 bottom-2 h-20 rounded-[50%] bg-black/45 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-white/[0.08] bg-[radial-gradient(circle_at_50%_42%,rgba(94,196,255,0.12),transparent_58%)]" />
            <div className="absolute inset-10 rounded-full border border-dashed border-white/[0.12]" />

            <div className="relative h-[322px] w-[322px] sm:h-[406px] sm:w-[406px] lg:h-[520px] lg:w-[520px]">
              <div className="absolute left-1/2 top-1/2 scale-[0.62] sm:scale-[0.78] lg:scale-100 -translate-x-1/2 -translate-y-1/2">
                <GlobeLazy size={520} autoRotateSpeed={0.42} interactive={!prefersReducedMotion} eager />
              </div>
            </div>

            <div className="absolute left-0 top-8 hidden w-52 rounded-2xl border border-white/[0.1] bg-canvas/70 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:block">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-200">
                <Route className="h-3.5 w-3.5 text-aurora-light" />
                Match route
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-coral-light" />
                Lisbon
                <span className="h-px flex-1 bg-white/[0.12]" />
                <Plane className="h-3.5 w-3.5 text-sand-light" />
                Bangkok
              </div>
            </div>

            <div className="absolute bottom-5 right-0 w-56 rounded-2xl border border-white/[0.1] bg-canvas/75 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Signals checked</p>
              <div className="space-y-2">
                {SIGNALS.map((signal) => (
                  <div key={signal.label} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-300">
                      <signal.icon className="h-3.5 w-3.5 text-voyage-300" />
                      {signal.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{signal.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
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

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </section>
  );
}

export default HeroSection;
