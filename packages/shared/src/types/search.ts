export interface SearchRequest {
  query: string;
}

export interface ExtractedIntent {
  budget: 'budget' | 'mid' | 'luxury' | null;
  temp_pref: 'cold' | 'mild' | 'warm' | 'hot' | null;
  month: number | null;
  trip_styles: string[];
  safety_priority: 'low' | 'medium' | 'high';
  duration_days: number | null;
  region_pref: string | null;
  vibe_description: string;
}

export interface DimensionScores {
  weather: number;
  budget: number;
  safety: number;
  vibe: number;
}

export interface MatchResult {
  destinationId: string;
  city: string;
  country: string;
  continent: string;
  description: string;
  imageUrl: string | null;
  compositeScore: number;
  scores: DimensionScores;
  tags: string[];
  dailyBudgetMid: number;
  safetyScore: number;
  avgTempC: number | null;
}

export interface SearchResponse {
  query: string;
  intent: ExtractedIntent;
  results: MatchResult[];
  totalCandidates: number;
}
