import { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTypewriter } from '@/hooks/useTypewriter';
import { EXAMPLE_QUERIES } from '@/lib/constants';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  defaultValue?: string;
  onSearch?: (query: string) => void;
  onFocusChange?: (focused: boolean) => void;
  onActivityChange?: (active: boolean) => void;
}

export function SearchBar({
  variant = 'hero',
  defaultValue = '',
  onSearch,
  onFocusChange,
  onActivityChange,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { text: typedPlaceholder } = useTypewriter({
    strings: EXAMPLE_QUERIES,
    typeSpeed: 50,
    deleteSpeed: 25,
    pauseDuration: 3000,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const isHero = variant === 'hero';

  useEffect(() => {
    if (!onActivityChange) return;
    onActivityChange(isFocused || query.trim().length > 0);
  }, [isFocused, onActivityChange, query]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        className={cn(
          'relative flex items-center rounded-2xl transition-all duration-500',
          isHero
            ? cn(
                'bg-white/[0.04] backdrop-blur-2xl border shadow-2xl',
                isFocused
                  ? 'border-voyage-400/70 shadow-[0_0_70px_rgba(26,141,255,0.22)]'
                  : isHovered
                    ? 'border-white/[0.14] shadow-[0_0_42px_rgba(26,141,255,0.14)]'
                    : 'border-white/[0.08] shadow-black/20',
              )
            : cn(
                'bg-white/[0.04] backdrop-blur-xl border shadow-lg',
                isFocused
                  ? 'border-voyage-500/40 shadow-[0_0_40px_rgba(51,119,255,0.1)]'
                  : 'border-white/[0.06] shadow-black/5',
              ),
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated gradient border on focus */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, rgba(15,111,255,0.36), rgba(55,184,255,0.26), rgba(15,111,255,0.36))',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease infinite',
                padding: '1px',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
              }}
            />
          )}
        </AnimatePresence>

        {/* Sparkles icon with animation */}
        <div className="flex items-center pl-5">
          <motion.div
            animate={{
              rotate: isFocused ? [0, 15, -15, 0] : 0,
              scale: isFocused ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles
              className={cn(
                'h-5 w-5 transition-colors duration-300',
                isFocused ? 'text-aurora-light' : 'text-slate-500',
              )}
            />
          </motion.div>
        </div>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              onFocusChange?.(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              onFocusChange?.(false);
            }}
            placeholder={isHero && !query ? '' : 'Where do you dream of going?'}
            className={cn(
              'w-full bg-transparent border-none outline-none text-white placeholder:text-slate-500',
              isHero ? 'px-5 py-5 text-xl' : 'px-4 py-3.5 text-base',
            )}
          />
          
          {/* Typewriter placeholder for hero */}
          {isHero && !query && !isFocused && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-slate-500">{typedPlaceholder}</span>
              <motion.span
                className="inline-block w-[2px] h-6 bg-slate-500 ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
          )}
        </div>

        {/* Clear button */}
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <div className="pr-2.5">
          <motion.button
            type="submit"
            disabled={!query.trim()}
            className={cn(
              'flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              'relative overflow-hidden group',
              isHero
                ? 'bg-voyage-500 text-slate-50 border border-voyage-300/50 px-7 py-3.5 shadow-[0_0_30px_rgba(26,141,255,0.4)] hover:bg-voyage-400 hover:shadow-[0_0_42px_rgba(26,141,255,0.5)] focus-visible:ring-2 focus-visible:ring-voyage-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
                : 'gradient-ai text-slate-50 px-4 py-2.5',
            )}
            whileHover={query.trim() ? { scale: 1.02 } : {}}
            whileTap={query.trim() ? { scale: 0.98 } : {}}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            
            {isHero ? (
              <motion.div
                className="relative z-10 flex items-center gap-2"
                animate={{ x: query.trim() ? [0, 3, 0] : 0 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            ) : (
              <div className="relative z-10 flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>
    </form>
  );
}
