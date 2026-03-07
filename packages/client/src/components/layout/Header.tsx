import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSolid = !isHome || scrolled;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        showSolid
          ? 'bg-white/90 dark:bg-night/90 backdrop-blur-lg border-b border-gray-100 dark:border-white/10 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-ai text-white transition-transform group-hover:scale-110">
              <Compass className="h-5 w-5" />
            </div>
            <span
              className={cn(
                'font-display text-xl font-bold tracking-tight',
                showSolid ? 'text-gray-900 dark:text-white' : 'text-white',
              )}
            >
              Globe<span className="gradient-ai-text">Sense</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <Link
              to="/destinations"
              className={cn(
                'text-sm font-medium transition-colors relative',
                showSolid
                  ? 'text-gray-600 dark:text-gray-300 hover:text-voyage-600 dark:hover:text-voyage-400'
                  : 'text-white/80 hover:text-white',
                'after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-full',
              )}
            >
              Explore
            </Link>

            <button
              onClick={toggleTheme}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                showSolid
                  ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                  : 'text-white/70 hover:bg-white/10',
              )}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link to="/search">
              <Button variant={showSolid ? 'ai' : 'secondary'} size="sm">
                Search
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                showSolid
                  ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                  : 'text-white/70 hover:bg-white/10',
              )}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              className="p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <X className={cn('h-6 w-6', showSolid ? 'text-gray-900 dark:text-white' : 'text-white')} />
              ) : (
                <Menu className={cn('h-6 w-6', showSolid ? 'text-gray-900 dark:text-white' : 'text-white')} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-night-light p-4 shadow-lg">
                <Link
                  to="/destinations"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Explore
                </Link>
                <Link to="/search" onClick={() => setMobileOpen(false)}>
                  <Button variant="ai" className="w-full" size="sm">
                    Search
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
