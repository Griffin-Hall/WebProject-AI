export const SCORE_WEIGHTS = {
  weather: 0.3,
  budget: 0.25,
  safety: 0.2,
  vibe: 0.25,
} as const;

export const TEMP_RANGES = {
  cold: { min: -10, max: 12 },
  mild: { min: 12, max: 24 },
  warm: { min: 20, max: 30 },
  hot: { min: 28, max: 50 },
} as const;

export const BUDGET_THRESHOLDS = {
  budget: 50,
  mid: 150,
  luxury: Infinity,
} as const;

export const SAFETY_THRESHOLD_HIGH = 70;
