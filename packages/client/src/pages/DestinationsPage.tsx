import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { useDestinations } from '@/hooks/useDestinations';
import { Card, Button, Skeleton, Badge } from '@/components/ui';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { CONTINENTS } from '@voyage-matcher/shared';
import { cn } from '@/lib/utils';

export function DestinationsPage() {
  const [page, setPage] = useState(1);
  const [continent, setContinent] = useState<string | undefined>();

  const { data, isLoading } = useDestinations({ page, limit: 12, continent });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-night">
      {/* Hero Header */}
      <div className="relative gradient-hero py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-aurora/10 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-voyage-400/10 blur-[80px]" />
        </div>
        <div className="container-narrow relative">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-aurora-light" />
            <span className="text-sm text-white/60 font-medium">Discover</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Explore the World
          </h1>
          <p className="mt-3 text-white/50 max-w-lg">
            Browse {data?.pagination.total ?? '...'} destinations across every continent.
          </p>
        </div>
      </div>

      {/* Continent Filter */}
      <div className="bg-white dark:bg-night border-b border-gray-100 dark:border-white/10 py-4 sticky top-16 z-40">
        <div className="container-narrow">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setContinent(undefined); setPage(1); }}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                !continent
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {!continent && (
                <motion.div
                  layoutId="continent-indicator"
                  className="absolute inset-0 rounded-full gradient-ai"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">All</span>
            </button>
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => { setContinent(c); setPage(1); }}
                className={cn(
                  'relative rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  continent === c
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {continent === c && (
                  <motion.div
                    layoutId="continent-indicator"
                    className="absolute inset-0 rounded-full gradient-ai"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                <Skeleton className="h-48 rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.data.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Link to={`/destinations/${dest.id}`}>
                    <Card hover className="group h-full">
                      <div className="relative h-48 overflow-hidden">
                        <ResponsiveImage
                          src={dest.imageUrl ?? ''}
                          alt={dest.city}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <h3 className="font-display text-lg font-bold text-white tracking-tight">
                            {dest.city}
                          </h3>
                          <div className="flex items-center gap-1 text-white/80 text-sm">
                            <MapPin className="h-3 w-3" />
                            {dest.country}
                          </div>
                        </div>
                        {dest.safety && (
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant={dest.safety.safetyScore >= 70 ? 'success' : 'warning'}
                              className="text-[10px]"
                            >
                              Safety: {dest.safety.safetyScore}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {dest.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {dest.tags.slice(0, 3).map((t) => (
                              <span
                                key={t.tag}
                                className="rounded-full bg-voyage-50 px-2 py-0.5 text-[10px] font-medium text-voyage-700"
                              >
                                {t.tag}
                              </span>
                            ))}
                          </div>
                          {dest.costs && (
                            <span className="text-xs text-gray-500">
                              ${Math.round(dest.costs.dailyBudgetMid)}/day
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
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
                <span className="text-sm text-gray-500">
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
        )}
      </div>
    </div>
  );
}
