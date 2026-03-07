import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeftRight, RotateCcw, MapPin } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useDestination } from '@/hooks/useDestinations';
import { api } from '@/lib/api';
import type { PaginatedResponse, DestinationDetail } from '@voyage-matcher/shared';
import { useHeroState } from './useHeroState';
import { computeVibeScores, computeMonthScores, generateItineraries } from './heroConstants';
import { HeroBackground } from './HeroBackground';
import { HeroSearchBar } from './HeroSearchBar';
import { DestinationChips } from './DestinationChips';
import { WorldMapInteractive } from './WorldMapInteractive';
import { FloatingParticles } from './FloatingParticles';
import { ScoreCards } from './ScoreCards';
import { VibeMeter } from './VibeMeter';
import { BestMonthsTimeline } from './BestMonthsTimeline';
import { ItineraryPreview } from './ItineraryPreview';
import { CompareMode } from './CompareMode';
import type { MatchResult } from '@voyage-matcher/shared';

/** Convert a full DestinationDetail into a MatchResult for hero display */
function detailToMatchResult(d: DestinationDetail): MatchResult {
  const avgTemp = d.weather.length > 0
    ? Math.round(d.weather.reduce((s, w) => s + w.avgTempC, 0) / d.weather.length)
    : null;
  return {
    destinationId: d.id,
    city: d.city,
    country: d.country,
    continent: d.continent,
    description: d.description,
    imageUrl: d.imageUrl,
    compositeScore: 0.85,
    scores: { weather: 0.8, budget: 0.8, safety: (d.safety?.safetyScore ?? 70) / 100, vibe: 0.9 },
    tags: d.tags.map(t => t.tag),
    dailyBudgetMid: d.costs?.dailyBudgetMid ?? 100,
    safetyScore: d.safety?.safetyScore ?? 70,
    avgTempC: avgTemp,
  };
}

/** Try to find a destination by direct city name lookup */
async function tryDirectLookup(query: string): Promise<DestinationDetail | null> {
  try {
    const res = await api.get<PaginatedResponse<DestinationDetail>>(
      `/api/destinations?search=${encodeURIComponent(query)}&limit=5`,
    );
    if (!res.success || res.data.length === 0) return null;
    const q = query.toLowerCase().trim();
    // Prefer exact city name match, then partial
    return res.data.find(d => d.city.toLowerCase() === q)
      || res.data.find(d => d.city.toLowerCase().includes(q))
      || null;
  } catch {
    return null;
  }
}

export function HeroSection() {
  const [state, dispatch] = useHeroState();
  const searchMutation = useSearch();
  const compareSearchMutation = useSearch();

  // Fetch full detail for primary result (only if AI search path — no detail yet)
  const { data: primaryDetail } = useDestination(
    state.primaryResult && !state.primaryDetail ? state.primaryResult.destinationId : '',
  );
  // Fetch full detail for compare result
  const { data: compareDetail } = useDestination(state.compareResult?.destinationId || '');

  // When primary detail loads via hook (AI search path), update state
  useEffect(() => {
    if (primaryDetail && state.phase === 'loading' && state.primaryResult) {
      dispatch({ type: 'DETAIL_LOADED', detail: primaryDetail });
    }
  }, [primaryDetail, state.phase, state.primaryResult, dispatch]);

  // Handle primary search — try direct city lookup first, fallback to AI search
  const handleSearch = useCallback(async (query: string) => {
    dispatch({ type: 'SEARCH_START', query });

    // Step 1: Try direct city name match
    const directMatch = await tryDirectLookup(query);
    if (directMatch) {
      dispatch({ type: 'DIRECT_MATCH', result: detailToMatchResult(directMatch), detail: directMatch });
      return;
    }

    // Step 2: Fallback to AI-powered search
    searchMutation.mutate(query, {
      onSuccess: (data) => {
        if (data.results.length > 0) {
          dispatch({ type: 'SEARCH_SUCCESS', response: data, result: data.results[0] });
        } else {
          dispatch({ type: 'SEARCH_ERROR' });
        }
      },
      onError: () => dispatch({ type: 'SEARCH_ERROR' }),
    });
  }, [dispatch, searchMutation]);

  // Handle compare search — same direct-first approach
  const handleCompareSearch = useCallback(async (query: string) => {
    dispatch({ type: 'COMPARE_SEARCH_START', query });

    const directMatch = await tryDirectLookup(query);
    if (directMatch) {
      dispatch({ type: 'COMPARE_SEARCH_SUCCESS', result: detailToMatchResult(directMatch), detail: directMatch });
      return;
    }

    compareSearchMutation.mutate(query, {
      onSuccess: (data) => {
        if (data.results.length > 0) {
          dispatch({ type: 'COMPARE_SEARCH_SUCCESS', result: data.results[0], detail: null as unknown as DestinationDetail });
        }
      },
    });
  }, [dispatch, compareSearchMutation]);

  // Update compare detail when it loads via hook
  useEffect(() => {
    if (compareDetail && state.compareResult && !state.compareDetail) {
      dispatch({ type: 'COMPARE_SEARCH_SUCCESS', result: state.compareResult, detail: compareDetail });
    }
  }, [compareDetail, state.compareResult, state.compareDetail, dispatch]);

  // Derived data for active state
  const vibes = state.primaryDetail
    ? computeVibeScores(
        state.primaryDetail.tags.map(t => t.tag),
        state.primaryDetail.costs?.dailyBudgetMid,
      )
    : [];
  const monthScores = state.primaryDetail?.weather
    ? computeMonthScores(state.primaryDetail.weather)
    : [];
  const itineraries = state.primaryDetail
    ? generateItineraries(
        state.primaryDetail.tags.map(t => t.tag),
        state.primaryDetail.costs?.dailyBudgetMid ?? 100,
      )
    : [];

  const targetCoords = state.primaryResult && state.primaryDetail
    ? { lat: state.primaryDetail.lat, lng: state.primaryDetail.lng }
    : null;

  return (
    <section className="relative -mt-16 pt-16 overflow-hidden min-h-[100dvh] flex flex-col">
      {/* Dynamic background */}
      <HeroBackground mood={state.mood} />
      <FloatingParticles />

      {/* World map backdrop */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className={state.phase === 'active' ? 'opacity-30' : 'opacity-[0.15]'}>
          <WorldMapInteractive
            targetCoords={targetCoords}
            mood={state.mood}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* ─── Landing State ─── */}
          {state.phase === 'landing' && (
            <motion.div
              key="landing"
              className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] backdrop-blur-sm px-4 py-1.5 text-xs text-white/70 mb-6 border border-white/[0.1]"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-aurora-light animate-sparkle" />
                AI-powered travel intelligence
              </motion.div>

              <motion.h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Search anywhere.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-aurora-light via-aurora to-voyage-300">
                  Let AI build the travel picture.
                </span>
              </motion.h1>

              <motion.p
                className="mt-5 text-sm sm:text-base lg:text-lg text-white/45 max-w-xl leading-relaxed text-balance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                Weather, cost, seasonality, crowd levels, safety, and personalized travel insights — in one immersive view.
              </motion.p>

              <motion.div
                className="mt-8 sm:mt-10 w-full max-w-lg"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <HeroSearchBar onSearch={handleSearch} loading={searchMutation.isPending} />
              </motion.div>

              <motion.div
                className="mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <DestinationChips onSelect={handleSearch} />
              </motion.div>
            </motion.div>
          )}

          {/* ─── Loading State ─── */}
          {state.phase === 'loading' && (
            <motion.div
              key="loading"
              className="flex-1 flex flex-col items-center justify-center text-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="h-12 w-12 rounded-full border-2 border-aurora/30 border-t-aurora"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="text-sm text-white/60">
                  Analyzing <span className="text-white font-medium">{state.query}</span>...
                </div>
                <div className="text-[11px] text-white/30">
                  Weather · Budget · Safety · Vibe
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ─── Active State ─── */}
          {state.phase === 'active' && state.primaryResult && (
            <motion.div
              key="active"
              className="flex-1 flex flex-col pt-4 pb-8 px-4 sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Top bar: compact search + destination name + actions */}
              <motion.div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-full sm:w-64 lg:w-80">
                  <HeroSearchBar
                    onSearch={handleSearch}
                    compact
                    loading={searchMutation.isPending}
                    defaultValue={state.query}
                  />
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin className="h-4 w-4 text-white/40 shrink-0" />
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white truncate">
                    {state.primaryResult.city}
                  </h2>
                  <span className="text-xs text-white/40 shrink-0">{state.primaryResult.country}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => dispatch({ type: 'ENABLE_COMPARE' })}
                    className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] px-3 py-1.5 text-[11px] text-white/60 hover:text-white/80 transition-all"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Compare
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'RESET' })}
                    className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/[0.08] transition-colors"
                    title="New search"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-white/40" />
                  </button>
                </div>
              </motion.div>

              {/* Data panels grid */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 max-w-6xl mx-auto w-full">
                {/* Left column */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <ScoreCards
                    scores={state.primaryResult.scores}
                    accentColor={state.mood.accentColor}
                    delay={0.2}
                  />
                  {vibes.length > 0 && (
                    <VibeMeter
                      vibes={vibes}
                      accentColor={state.mood.accentColor}
                      delay={0.4}
                    />
                  )}
                  {itineraries.length > 0 && (
                    <ItineraryPreview
                      itineraries={itineraries}
                      city={state.primaryResult.city}
                      accentColor={state.mood.accentColor}
                      delay={0.7}
                    />
                  )}
                </div>

                {/* Right column */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  {monthScores.length > 0 && (
                    <BestMonthsTimeline
                      monthScores={monthScores}
                      accentColor={state.mood.accentColor}
                      delay={0.5}
                    />
                  )}

                  {/* AI Summary card */}
                  {state.searchResponse?.intent && (
                    <motion.div
                      className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <h3 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-aurora-light" />
                        AI Analysis
                      </h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {state.searchResponse.intent.vibe_description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {state.primaryResult.tags.slice(0, 5).map(tag => (
                          <span key={tag} className="rounded-full bg-white/[0.06] text-[9px] text-white/45 px-2 py-0.5 border border-white/[0.06]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Match score highlight */}
                  <motion.div
                    className="rounded-xl border p-4 flex items-center gap-4"
                    style={{
                      borderColor: state.mood.accentColor + '30',
                      background: state.mood.accentColor + '08',
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <div className="text-center shrink-0">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(state.primaryResult.compositeScore * 100)}%
                      </div>
                      <div className="text-[9px] text-white/40">Overall Match</div>
                    </div>
                    <div className="text-xs text-white/50 leading-relaxed">
                      {state.primaryResult.city} scores{' '}
                      {state.primaryResult.compositeScore >= 0.8 ? 'excellent' :
                       state.primaryResult.compositeScore >= 0.6 ? 'great' : 'well'}{' '}
                      across weather, budget, safety, and vibe for your search.
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare Mode Overlay */}
        <AnimatePresence>
          {state.compareMode && state.primaryResult && (
            <CompareMode
              primary={state.primaryResult}
              primaryDetail={state.primaryDetail}
              secondary={state.compareResult}
              secondaryDetail={state.compareDetail}
              onSearch={handleCompareSearch}
              onClose={() => dispatch({ type: 'CLOSE_COMPARE' })}
              loading={compareSearchMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
