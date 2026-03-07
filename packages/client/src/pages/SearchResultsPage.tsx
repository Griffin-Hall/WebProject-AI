import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { MatchList } from '@/components/results/MatchList';
import { Badge, Button } from '@/components/ui';
import { useSearch } from '@/hooks/useSearch';
import { getAIConfig, PROVIDER_LABELS } from '@/hooks/useAIConfig';

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
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="border-b border-white/[0.04] py-6">
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
        {/* AI Status */}
        <div className="mb-6">
          {(() => {
            const cfg = getAIConfig();
            if (cfg) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>AI Powered</span>
                  <span className="text-slate-500 ml-1">• {PROVIDER_LABELS[cfg.provider]} ({cfg.model})</span>
                </motion.div>
              );
            }
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm border bg-amber-500/10 text-amber-400 border-amber-500/20"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>No AI Key</span>
                <span className="text-slate-500 ml-1">• Using keyword fallback</span>
              </motion.div>
            );
          })()}
        </div>

        {/* Intent Summary */}
        {data && (
          <motion.div
            className="mb-8 glass-card p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-ai text-slate-50">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
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
            <p className="text-sm text-slate-500">
              <span className="font-medium text-white">{data.results.length}</span> matches
              from {data.totalCandidates} destinations
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="font-medium text-red-400">Something went wrong</p>
            <p className="mt-1 text-sm text-red-400/70">
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
            <h2 className="mt-4 font-display text-xl font-semibold text-white tracking-tight">
              Start your search
            </h2>
            <p className="mt-2 text-slate-500">
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

export default SearchResultsPage;
