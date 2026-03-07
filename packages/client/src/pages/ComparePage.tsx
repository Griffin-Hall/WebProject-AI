import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ArrowLeft, GitCompareArrows, Globe, Shield, Thermometer, Wallet, X } from 'lucide-react';
import type { DestinationDetail } from '@voyage-matcher/shared';
import { CompareAIAssistant } from '@/components/compare/CompareAIAssistant';
import { Badge, Button, Skeleton } from '@/components/ui';
import { useCompareDestinations } from '@/hooks/useCompareDestinations';
import { api } from '@/lib/api';
import { cn, formatBudget } from '@/lib/utils';

function monthName(month: number) {
  return new Date(2025, month - 1).toLocaleString('en-US', { month: 'short' });
}

function getWeatherProfile(destination: DestinationDetail) {
  if (!destination.weather.length) {
    return {
      average: null,
      warmestMonth: null,
      coolestMonth: null,
      line: 'Weather data unavailable',
    };
  }

  const average =
    destination.weather.reduce((sum, month) => sum + month.avgTempC, 0) / destination.weather.length;
  const warmestMonth = destination.weather.reduce((best, month) =>
    month.avgTempC > best.avgTempC ? month : best,
  );
  const coolestMonth = destination.weather.reduce((best, month) =>
    month.avgTempC < best.avgTempC ? month : best,
  );

  return {
    average,
    warmestMonth,
    coolestMonth,
    line: `${Math.round(average)}°C avg | Warmest ${monthName(warmestMonth.month)} ${Math.round(warmestMonth.avgTempC)}°C`,
  };
}

function getSafetyText(destination: DestinationDetail) {
  if (!destination.safety) return 'No safety data';
  return `${destination.safety.safetyScore}/100 (${destination.safety.advisoryLevel} advisory)`;
}

export function ComparePage() {
  const { selected, selectedIds, clearSelection, removeDestination } = useCompareDestinations();

  const destinationQueries = useQueries({
    queries: selectedIds.map((id) => ({
      queryKey: ['destination', id],
      queryFn: async () => {
        const response = await api.get<{ success: boolean; data: DestinationDetail }>(
          `/api/destinations/${id}`,
        );
        return response.data;
      },
    })),
  });

  const isLoading =
    selectedIds.length > 0 && destinationQueries.some((query) => query.isLoading || query.isPending);

  const destinationById = new Map<string, DestinationDetail>();
  destinationQueries.forEach((query) => {
    if (query.data) destinationById.set(query.data.id, query.data);
  });

  const destinations = selected
    .map((item) => destinationById.get(item.id))
    .filter((destination): destination is DestinationDetail => !!destination);

  const comparisonRows = [
    {
      id: 'location',
      label: 'City / Country / Continent',
      icon: Globe,
      render: (destination: DestinationDetail) => (
        <div className="space-y-1.5">
          <p className="font-medium text-white">{destination.city}</p>
          <p className="text-sm text-slate-300">{destination.country}</p>
          <p className="text-xs uppercase tracking-wider text-slate-500">{destination.continent}</p>
        </div>
      ),
    },
    {
      id: 'weather',
      label: 'Weather Profile',
      icon: Thermometer,
      render: (destination: DestinationDetail) => {
        const profile = getWeatherProfile(destination);
        return (
          <div className="space-y-1.5">
            <p className="text-sm text-slate-200">{profile.line}</p>
            {profile.coolestMonth && (
              <p className="text-xs text-slate-500">
                Coolest {monthName(profile.coolestMonth.month)} {Math.round(profile.coolestMonth.avgTempC)}°C
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'cost',
      label: 'Cost Tiers (Daily)',
      icon: Wallet,
      render: (destination: DestinationDetail) => (
        <div className="space-y-1.5">
          {destination.costs ? (
            <>
              <p className="text-sm text-slate-200">Budget: {formatBudget(destination.costs.dailyBudgetLow)}</p>
              <p className="text-sm text-slate-200">Mid: {formatBudget(destination.costs.dailyBudgetMid)}</p>
              <p className="text-sm text-slate-200">Luxury: {formatBudget(destination.costs.dailyBudgetHigh)}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Cost data unavailable</p>
          )}
        </div>
      ),
    },
    {
      id: 'safety',
      label: 'Safety Score',
      icon: Shield,
      render: (destination: DestinationDetail) => (
        <div className="space-y-2">
          <p className="text-sm text-slate-200">{getSafetyText(destination)}</p>
          {destination.safety && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  'h-full rounded-full',
                  destination.safety.safetyScore >= 75
                    ? 'bg-emerald-400'
                    : destination.safety.safetyScore >= 55
                      ? 'bg-amber-400'
                      : 'bg-red-400',
                )}
                style={{ width: `${destination.safety.safetyScore}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'vibe',
      label: 'Tags / Vibe',
      icon: GitCompareArrows,
      render: (destination: DestinationDetail) => (
        <div className="flex flex-wrap gap-1.5">
          {destination.tags.slice(0, 8).map((tag) => (
            <Badge key={tag.id} variant="default">
              {tag.tag}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  if (selectedIds.length < 2) {
    return (
      <div className="container-narrow py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <GitCompareArrows className="mx-auto h-10 w-10 text-voyage-300" />
          <h1 className="mt-5 font-display text-3xl font-bold text-white">Select More Destinations</h1>
          <p className="mt-3 text-slate-400">
            {selectedIds.length === 1
              ? 'You currently have 1 destination selected. Please add at least one more to compare side by side.'
              : 'Pick up to four destinations from Explore or Search, then compare them side by side here.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/destinations">
              <Button variant="ai">
                Start from Explore
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline">Search first</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <section className="border-b border-white/[0.06] py-10">
        <div className="container-shell">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to destinations
              </Link>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">
                Compare Destinations
              </h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Evaluate weather, budget, safety, and vibe in one view, then ask the AI compare agent for a recommendation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-voyage-500/30 bg-voyage-500/15 px-3 py-1 text-xs font-semibold text-voyage-200">
                {selectedIds.length} selected
              </span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear all
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-shell space-y-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <Skeleton className="h-44" />
                <Skeleton className="mt-4 h-4 w-1/2" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] md:block">
              <div
                className="grid min-w-[920px]"
                style={{ gridTemplateColumns: `240px repeat(${Math.max(destinations.length, 1)}, minmax(220px, 1fr))` }}
              >
                <div className="border-b border-white/[0.08] bg-white/[0.02] p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Comparison
                </div>
                {destinations.map((destination) => (
                  <div key={destination.id} className="border-b border-l border-white/[0.08] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-lg font-semibold text-white">{destination.city}</p>
                        <p className="text-sm text-slate-400">{destination.country}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDestination(destination.id)}
                        className="rounded-full border border-white/[0.12] p-1 text-slate-400 transition-colors hover:text-white"
                        aria-label={`Remove ${destination.city}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {comparisonRows.map((row) => (
                  <Fragment key={row.id}>
                    <div className="border-t border-white/[0.08] p-4">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <row.icon className="h-4 w-4 text-voyage-300" />
                        {row.label}
                      </p>
                    </div>
                    {destinations.map((destination) => (
                      <div key={`${row.id}-${destination.id}`} className="border-l border-t border-white/[0.08] p-4">
                        {row.render(destination)}
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {destinations.map((destination) => {
                const weather = getWeatherProfile(destination);
                return (
                  <article key={destination.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-white">{destination.city}</h2>
                        <p className="text-sm text-slate-400">
                          {destination.country} | {destination.continent}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDestination(destination.id)}
                        className="rounded-full border border-white/[0.12] p-1 text-slate-400 transition-colors hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <p className="text-slate-200">
                        <span className="text-slate-500">Weather:</span> {weather.line}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-500">Costs:</span>{' '}
                        {destination.costs
                          ? `${formatBudget(destination.costs.dailyBudgetLow)} / ${formatBudget(destination.costs.dailyBudgetMid)} / ${formatBudget(destination.costs.dailyBudgetHigh)}`
                          : 'Unavailable'}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-500">Safety:</span> {getSafetyText(destination)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {destination.tags.slice(0, 6).map((tag) => (
                        <Badge key={tag.id} variant="default">
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            {destinations.length > 0 && <CompareAIAssistant destinations={destinations} />}
          </>
        )}
      </div>
    </div>
  );
}

export default ComparePage;
