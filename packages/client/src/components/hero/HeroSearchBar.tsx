import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HERO_PLACEHOLDERS } from './heroConstants';

interface HeroSearchBarProps {
  onSearch: (query: string) => void;
  compact?: boolean;
  loading?: boolean;
  defaultValue?: string;
}

export function HeroSearchBar({ onSearch, compact = false, loading = false, defaultValue = '' }: HeroSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    if (focused || query) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % HERO_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [focused, query]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && !loading) {
      onSearch(trimmed);
    }
  }, [query, loading, onSearch]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <motion.div
        layout
        className={cn(
          'relative flex items-center rounded-2xl transition-all duration-300',
          compact
            ? 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg'
            : 'bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] shadow-2xl shadow-black/20',
          focused && !compact && 'ring-2 ring-aurora/30 border-aurora/20 shadow-[0_0_40px_rgba(168,85,247,0.15)]',
          focused && compact && 'ring-1 ring-aurora/30 border-aurora/20',
        )}
      >
        {/* AI sparkle icon */}
        <div className={cn('flex items-center justify-center', compact ? 'pl-4' : 'pl-5 sm:pl-6')}>
          <Sparkles
            className={cn(
              'transition-all duration-300',
              compact ? 'h-4 w-4' : 'h-5 w-5',
              focused ? 'text-aurora-light scale-110' : 'text-white/40',
            )}
          />
        </div>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full bg-transparent text-white placeholder-transparent outline-none',
              compact ? 'px-3 py-3.5 text-sm' : 'px-3 sm:px-4 py-5 sm:py-6 text-base sm:text-lg',
            )}
            aria-label="Search a destination"
          />

          {/* Animated placeholder */}
          {!query && (
            <div className={cn(
              'absolute inset-0 flex items-center pointer-events-none',
              compact ? 'px-3' : 'px-3 sm:px-4',
            )}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  className={cn(
                    'text-white/30',
                    compact ? 'text-sm' : 'text-base sm:text-lg',
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {HERO_PLACEHOLDERS[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className={cn(compact ? 'pr-2' : 'pr-3 sm:pr-4')}>
          <motion.button
            type="submit"
            disabled={!query.trim() || loading}
            className={cn(
              'flex items-center justify-center rounded-xl gradient-ai text-white transition-all',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              compact ? 'h-8 w-8' : 'h-10 w-10 sm:h-12 sm:w-12',
              query.trim() && !loading && 'shadow-lg shadow-aurora/25 hover:shadow-xl hover:shadow-aurora/30',
            )}
            whileHover={query.trim() && !loading ? { scale: 1.05 } : {}}
            whileTap={query.trim() && !loading ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <motion.div
                className={cn(compact ? 'h-4 w-4' : 'h-5 w-5', 'border-2 border-white/30 border-t-white rounded-full')}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <ArrowRight className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
            )}
          </motion.button>
        </div>
      </motion.div>
    </form>
  );
}
