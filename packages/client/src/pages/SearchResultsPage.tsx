import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { MatchList } from '@/components/results/MatchList';
import { Badge, Button } from '@/components/ui';
import { useSearch } from '@/hooks/useSearch';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { mutate, data, isPending, isError, error } = useSearch();

  useEffect(() => {
    if (query) {
      mutate(query);
    }
  }, [query, mutate]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-night">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-voyage-50/80 to-aurora/5 dark:from-night-light dark:to-night border-b border-gray-100 dark:border-white/10 py-6">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              variant="compact"
              defaultValue={query}
              onSearch={(q) => {
                const params = new URLSearchParams();
                params.set('q', q);
                window.history.pushState(null, '', `/search?${params.toString()}`);
                mutate(q);
              }}
            />
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        {/* Intent Summary */}
        {data && (
          <motion.div
            className="mb-8 rounded-xl bg-white dark:bg-night-light border border-gray-100 dark:border-white/10 p-4 border-l-4 border-l-transparent"
            style={{ borderImageSource: 'linear-gradient(to bottom, #1a5af5, #A855F7)', borderImageSlice: '1 0 1 1' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-ai text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  AI understood your query
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.intent.budget && (
                    <Badge variant="ai">Budget: {data.intent.budget}</Badge>
                  )}
                  {data.intent.temp_pref && (
                    <Badge variant="ai">Temp: {data.intent.temp_pref}</Badge>
                  )}
                  {data.intent.month && (
                    <Badge variant="ai">
                      Month: {new Date(2024, data.intent.month - 1).toLocaleString('en', { month: 'long' })}
                    </Badge>
                  )}
                  {data.intent.safety_priority !== 'medium' && (
                    <Badge variant="ai">Safety: {data.intent.safety_priority}</Badge>
                  )}
                  {data.intent.region_pref && (
                    <Badge variant="ai">Region: {data.intent.region_pref}</Badge>
                  )}
                  {data.intent.trip_styles.map((style) => (
                    <Badge key={style} variant="default">{style}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Header */}
        {data && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{data.results.length}</span> matches
              from {data.totalCandidates} destinations
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center">
            <p className="font-medium text-red-800">Something went wrong</p>
            <p className="mt-1 text-sm text-red-600">
              {error?.message || 'Failed to process your search. Please try again.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => mutate(query)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Results */}
        <MatchList results={data?.results ?? []} isLoading={isPending} />

        {/* No query state */}
        {!query && !isPending && (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 text-aurora/30 mx-auto" />
            <h2 className="mt-4 font-display text-xl font-semibold text-gray-900 tracking-tight">
              Start your search
            </h2>
            <p className="mt-2 text-gray-500">
              Describe your ideal trip in the search bar above.
            </p>
            <Link to="/">
              <Button variant="ghost" size="sm" className="mt-4">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
