import { prisma } from '../config/database.js';
import {
  computeWeatherScore,
  computeBudgetScore,
  computeSafetyScore,
  computeCompositeScore,
} from '../utils/scoring.js';
import type { ExtractedIntent, MatchResult, DimensionScores } from '@voyage-matcher/shared';
import type { Prisma } from '@prisma/client';

type DestinationWithRelations = Prisma.DestinationGetPayload<{
  include: { weather: true; costs: true; safety: true; tags: true };
}>;

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

  let vibeScore = 0.5;
  if (intent.trip_styles.length > 0) {
    const destTags = dest.tags.map((t) => t.tag.toLowerCase());
    const matchedTags = intent.trip_styles.filter((s) =>
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
  };
}
