import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDestinations } from '@/hooks/useDestinations';
import { DestinationCard } from '@/components/destination/DestinationCard';
import { Button, Skeleton } from '@/components/ui';
import { CONTINENTS } from '@voyage-matcher/shared';
import { cn } from '@/lib/utils';

/**
 * Destinations Page
 * 
 * Features:
 * - Optimized card rendering with memoization to prevent flicker
 * - Stable keys and reduced re-renders
 * - Smooth continent filter transitions
 */
export function DestinationsPage() {
  const [page, setPage] = useState(1);
  const [continent, setContinent] = useState<string | undefined>();

  const { data, isLoading } = useDestinations({ page, limit: 24, continent });

  // Memoized handlers to prevent unnecessary re-renders
  const handleContinentChange = useCallback((newContinent: string | undefined) => {
    setContinent(newContinent);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="ambient-blob ambient-blob-aurora w-64 h-64 -top-20 -right-20 opacity-40" />
          <div className="ambient-blob ambient-blob-voyage w-64 h-64 -bottom-20 -left-20 opacity-30" />
        </div>
        <div className="container-narrow relative">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-aurora-light" />
            <span className="text-sm text-slate-500 font-medium">Discover</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Explore the World
          </h1>
          <p className="mt-3 text-slate-500 max-w-lg">
            Browse {data?.pagination.total ?? '...'} destinations across every continent.
          </p>
        </div>
      </div>

      {/* Continent Filter */}
      <div className="bg-canvas/80 backdrop-blur-xl border-b border-white/[0.04] py-4 sticky top-16 z-40">
        <div className="container-narrow">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              isActive={!continent}
              onClick={() => handleContinentChange(undefined)}
            />
            {CONTINENTS.map((c) => (
              <FilterButton
                key={c}
                label={c}
                isActive={continent === c}
                onClick={() => handleContinentChange(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        {isLoading ? (
          <DestinationsGridSkeleton />
        ) : data?.data.length ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((dest, i) => (
                <DestinationCard 
                  key={dest.id} 
                  destination={dest} 
                  index={i}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-slate-500">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No destinations found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Memoized Filter Button to prevent re-renders
 */
interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton = memo(function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full px-4 py-1.5 text-sm font-medium transition-all',
        isActive ? 'text-slate-50' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.06] hover:text-white'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="continent-indicator"
          className="absolute inset-0 rounded-full gradient-ai"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
});

export default DestinationsPage;

/**
 * Loading skeleton for destinations grid
 */
function DestinationsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02]"
        >
          <Skeleton className="h-48 rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
