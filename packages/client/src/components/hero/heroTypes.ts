import type { MatchResult, DestinationDetail, SearchResponse } from '@voyage-matcher/shared';

export interface DestinationMood {
  name: string;
  gradient: string;
  accentColor: string;
  particleColor: string;
}

export interface HeroState {
  phase: 'landing' | 'loading' | 'active';
  query: string;
  searchResponse: SearchResponse | null;
  primaryResult: MatchResult | null;
  primaryDetail: DestinationDetail | null;
  mood: DestinationMood;
  compareMode: boolean;
  compareQuery: string;
  compareResult: MatchResult | null;
  compareDetail: DestinationDetail | null;
}

export type HeroAction =
  | { type: 'SEARCH_START'; query: string }
  | { type: 'SEARCH_SUCCESS'; response: SearchResponse; result: MatchResult }
  | { type: 'DIRECT_MATCH'; result: MatchResult; detail: DestinationDetail }
  | { type: 'DETAIL_LOADED'; detail: DestinationDetail }
  | { type: 'SEARCH_ERROR' }
  | { type: 'RESET' }
  | { type: 'ENABLE_COMPARE' }
  | { type: 'COMPARE_SEARCH_START'; query: string }
  | { type: 'COMPARE_SEARCH_SUCCESS'; result: MatchResult; detail: DestinationDetail }
  | { type: 'CLOSE_COMPARE' };
