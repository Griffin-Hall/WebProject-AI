import { SCORE_WEIGHTS, TEMP_RANGES, BUDGET_THRESHOLDS } from '@voyage-matcher/shared';
import type { ExtractedIntent, DimensionScores } from '@voyage-matcher/shared';

export function computeWeatherScore(
  avgTempC: number | null,
  intent: ExtractedIntent,
): number {
  if (!intent.temp_pref || avgTempC === null) return 0.5;

  const range = TEMP_RANGES[intent.temp_pref];
  const ideal = (range.min + range.max) / 2;
  const distance = Math.abs(avgTempC - ideal);
  const maxDistance = 30;

  return Math.max(0, 1 - distance / maxDistance);
}

export function computeBudgetScore(
  dailyBudgetMid: number,
  intent: ExtractedIntent,
): number {
  if (!intent.budget) return 0.5;

  const threshold = BUDGET_THRESHOLDS[intent.budget];
  if (threshold === Infinity) return 1;

  if (dailyBudgetMid <= threshold) return 1;

  const overBy = dailyBudgetMid - threshold;
  const decay = Math.max(0, 1 - overBy / threshold);
  return decay;
}

export function computeSafetyScore(safetyScore: number): number {
  return safetyScore / 100;
}

export function computeCompositeScore(scores: DimensionScores): number {
  return (
    SCORE_WEIGHTS.weather * scores.weather +
    SCORE_WEIGHTS.budget * scores.budget +
    SCORE_WEIGHTS.safety * scores.safety +
    SCORE_WEIGHTS.vibe * scores.vibe
  );
}
