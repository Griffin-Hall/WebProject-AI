import { prisma } from '../config/database.js';
import {
  computeWeatherScore,
  computeBudgetScore,
  computeSafetyScore,
  computeCompositeScore,
} from '../utils/scoring.js';
import type { ExtractedIntent, MatchResult, DimensionScores, MatchSourceLink } from '@globesense/shared';
import type { Prisma } from '@prisma/client';

type DestinationWithRelations = Prisma.DestinationGetPayload<{
  include: { weather: true; costs: true; safety: true; tags: true };
}>;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export async function findAndRankDestinations(
  intent: ExtractedIntent,
): Promise<{ results: MatchResult[]; totalCandidates: number }> {
  const where: Prisma.DestinationWhereInput = {};

  if (intent.region_pref) {
    where.OR = [
      { continent: { contains: intent.region_pref, mode: 'insensitive' } },
      { country: { contains: intent.region_pref, mode: 'insensitive' } },
    ];
  }

  const candidates = await prisma.destination.findMany({
    where,
    include: {
      weather: true,
      costs: true,
      safety: true,
      tags: true,
    },
  });

  const scored = candidates.map((dest) => scoreDestination(dest, intent));

  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  return {
    results: scored.slice(0, 20),
    totalCandidates: candidates.length,
  };
}

function scoreDestination(
  dest: DestinationWithRelations,
  intent: ExtractedIntent,
): MatchResult {
  const monthWeather = intent.month
    ? dest.weather.find((w) => w.month === intent.month)
    : null;

  const avgTempC = monthWeather ? monthWeather.avgTempC : null;

  const weatherScore = computeWeatherScore(avgTempC, intent);
  const budgetScore = dest.costs
    ? computeBudgetScore(dest.costs.dailyBudgetMid, intent)
    : 0.5;
  const safetyScore = dest.safety
    ? computeSafetyScore(dest.safety.safetyScore)
    : 0.5;

  const destTags = dest.tags.map((t) => t.tag.toLowerCase());
  let matchedTags: string[] = [];
  let vibeScore = 0.5;
  if (intent.trip_styles.length > 0) {
    matchedTags = intent.trip_styles.filter((s) =>
      destTags.some((t) => t.includes(s.toLowerCase()) || s.toLowerCase().includes(t)),
    );
    vibeScore = intent.trip_styles.length > 0
      ? matchedTags.length / intent.trip_styles.length
      : 0.5;
  }

  const scores: DimensionScores = {
    weather: weatherScore,
    budget: budgetScore,
    safety: safetyScore,
    vibe: vibeScore,
  };

  return {
    destinationId: dest.id,
    city: dest.city,
    country: dest.country,
    continent: dest.continent,
    description: dest.description,
    imageUrl: dest.imageUrl,
    compositeScore: computeCompositeScore(scores),
    scores,
    tags: dest.tags.map((t) => t.tag),
    dailyBudgetMid: dest.costs?.dailyBudgetMid ?? 0,
    safetyScore: dest.safety?.safetyScore ?? 50,
    avgTempC,
    matchReasons: buildMatchReasons(dest, intent, scores, avgTempC, matchedTags),
    sourceLinks: buildSourceLinks(dest.city, dest.country),
  };
}

function buildMatchReasons(
  dest: DestinationWithRelations,
  intent: ExtractedIntent,
  scores: DimensionScores,
  avgTempC: number | null,
  matchedTags: string[],
): string[] {
  const reasons: string[] = [];

  if (intent.region_pref) {
    const region = intent.region_pref.toLowerCase();
    const matchesRegion =
      dest.continent.toLowerCase().includes(region) || dest.country.toLowerCase().includes(region);

    if (matchesRegion) {
      reasons.push(`Located in ${dest.continent}, matching your ${intent.region_pref} preference.`);
    }
  }

  if (intent.month && avgTempC !== null) {
    const monthName = MONTH_NAMES[intent.month - 1];
    const tempNote = intent.temp_pref ? ` for a ${intent.temp_pref} weather preference` : '';
    reasons.push(`${monthName} averages about ${Math.round(avgTempC)}C${tempNote}.`);
  }

  if (intent.budget && dest.costs) {
    const budget = Math.round(dest.costs.dailyBudgetMid);
    const fit =
      scores.budget >= 0.8 ? 'strong' : scores.budget >= 0.6 ? 'reasonable' : 'loose';
    reasons.push(`Mid-range local costs are about $${budget}/day, a ${fit} fit for a ${intent.budget} trip.`);
  }

  if (matchedTags.length > 0) {
    reasons.push(`Matches your ${matchedTags.slice(0, 3).join(', ')} travel style.`);
  }

  if (intent.safety_priority === 'high' && dest.safety) {
    reasons.push(`Safety score is ${dest.safety.safetyScore}/100 for a higher-safety search.`);
  } else if (dest.safety && scores.safety >= 0.8) {
    reasons.push(`Safety score is ${dest.safety.safetyScore}/100, which supports a smoother trip.`);
  }

  if (reasons.length === 0) {
    const strongest = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'overall';
    reasons.push(`Ranked highly on ${strongest} fit against your search.`);
  }

  return reasons.slice(0, 4);
}

function buildSourceLinks(city: string, country: string): MatchSourceLink[] {
  const location = encodeURIComponent(`${city}, ${country}`);
  const countryQuery = encodeURIComponent(country);

  return [
    {
      label: 'Live weather',
      kind: 'weather',
      url: `https://www.timeanddate.com/weather/?query=${location}`,
    },
    {
      label: 'Travel advisory',
      kind: 'advisory',
      url: `https://travel.state.gov/content/travel/en/search.html?search_input=${countryQuery}`,
    },
    {
      label: 'Visa guidance',
      kind: 'visa',
      url: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html',
    },
    {
      label: 'Map',
      kind: 'map',
      url: `https://www.google.com/maps/search/?api=1&query=${location}`,
    },
  ];
}
