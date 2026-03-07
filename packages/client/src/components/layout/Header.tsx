import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, GitCompareArrows } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIKeyButton } from '@/components/ui/AIKeyPanel';
import { cn } from '@/lib/utils';
import { useCompareDestinations } from '@/hooks/useCompareDestinations';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { selected } = useCompareDestinations();
  const isHome = location.pathname === '/';
  const compareEnabled = selected.length >= 2;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showFrosted = !isHome || scrolled;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-500',
        showFrosted
          ? 'bg-canvas/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/10'
          : 'bg-transparent',
      )}
    >
      <div className="container-shell">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-ai text-slate-50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-aurora">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Globe<span className="gradient-ai-text">Sense</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/destinations"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-voyage-500 after:to-aurora after:transition-all after:duration-300 hover:after:w-full"
            >
              Explore
            </Link>
            {compareEnabled ? (
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare
                <span className="rounded-full bg-voyage-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-voyage-200">
                  {selected.length}
                </span>
              </Link>
            ) : (
              <span
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500"
                title="Select at least 2 destinations to compare"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare
                {selected.length > 0 && (
                  <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                    {selected.length}
                  </span>
                )}
              </span>
            )}
            {/* AI API Key configuration */}
            <AIKeyButton />
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white/90 hover:text-white border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.04] hover:bg-white/[0.06] transition-all duration-200"
            >
              Find Your Match
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-1 rounded-2xl bg-night-light/80 backdrop-blur-xl border border-white/[0.06] p-3">
                <Link
                  to="/destinations"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Explore
                </Link>
                {compareEnabled ? (
                  <Link
                    to="/compare"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center justify-between"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <GitCompareArrows className="h-4 w-4" />
                      Compare
                    </span>
                    <span className="rounded-full bg-voyage-500/20 px-2 py-0.5 text-[10px] font-semibold text-voyage-200">
                      {selected.length}
                    </span>
                  </Link>
                ) : (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-500 flex items-center justify-between cursor-not-allowed"
                    title="Select at least 2 destinations to compare"
                  >
                    <span className="inline-flex items-center gap-2">
                      <GitCompareArrows className="h-4 w-4" />
                      Compare
                    </span>
                    {selected.length > 0 && (
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        {selected.length}
                      </span>
                    )}
                  </div>
                )}
                <div className="px-4 py-3">
                  <AIKeyButton />
                </div>
                <Link
                  to="/search"
                  className="rounded-xl px-4 py-3 text-sm font-semibold gradient-ai text-slate-50 text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Find Your Match
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
