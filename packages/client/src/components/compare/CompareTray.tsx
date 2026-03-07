import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, GitCompareArrows, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useCompareDestinations } from '@/hooks/useCompareDestinations';

export function CompareTray() {
  const { selected, removeDestination, clearSelection } = useCompareDestinations();

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl"
        >
          <div className="glass-card-premium rounded-2xl p-3 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-voyage-500/15 px-2.5 py-1 text-[11px] font-semibold text-voyage-200">
                  <GitCompareArrows className="h-3 w-3" />
                  Compare List
                </span>
                {selected.map((destination) => (
                  <div
                    key={destination.id}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.04] px-2.5 py-1"
                  >
                    <span className="text-xs text-slate-200">
                      {destination.city}, {destination.country}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDestination(destination.id)}
                      className="text-slate-400 transition-colors hover:text-white"
                      aria-label={`Remove ${destination.city} from compare`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {selected.length >= 4 && (
                  <span className="hidden text-[11px] font-medium text-amber-300 sm:inline">
                    Max 4 selected
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Clear
                </button>
                {selected.length >= 2 ? (
                  <Link to="/compare">
                    <Button variant="ai" size="sm">
                      Compare {selected.length}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ai" size="sm" disabled>
                    Compare {selected.length}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
