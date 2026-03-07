import { useReducer } from 'react';
import type { HeroState, HeroAction } from './heroTypes';
import { DEFAULT_MOOD, resolveMood } from './heroConstants';

const initialState: HeroState = {
  phase: 'landing',
  query: '',
  searchResponse: null,
  primaryResult: null,
  primaryDetail: null,
  mood: DEFAULT_MOOD,
  compareMode: false,
  compareQuery: '',
  compareResult: null,
  compareDetail: null,
};

function heroReducer(state: HeroState, action: HeroAction): HeroState {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...state,
        phase: 'loading',
        query: action.query,
        compareMode: false,
        compareResult: null,
        compareDetail: null,
      };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        searchResponse: action.response,
        primaryResult: action.result,
        mood: resolveMood(action.result.city, action.result.continent),
      };
    case 'DIRECT_MATCH':
      return {
        ...state,
        phase: 'active',
        searchResponse: null,
        primaryResult: action.result,
        primaryDetail: action.detail,
        mood: resolveMood(action.result.city, action.result.continent),
      };
    case 'DETAIL_LOADED':
      return {
        ...state,
        phase: 'active',
        primaryDetail: action.detail,
      };
    case 'SEARCH_ERROR':
      return {
        ...state,
        phase: state.primaryResult ? 'active' : 'landing',
      };
    case 'RESET':
      return initialState;
    case 'ENABLE_COMPARE':
      return {
        ...state,
        compareMode: true,
      };
    case 'COMPARE_SEARCH_START':
      return {
        ...state,
        compareQuery: action.query,
      };
    case 'COMPARE_SEARCH_SUCCESS':
      return {
        ...state,
        compareResult: action.result,
        compareDetail: action.detail,
      };
    case 'CLOSE_COMPARE':
      return {
        ...state,
        compareMode: false,
        compareQuery: '',
        compareResult: null,
        compareDetail: null,
      };
    default:
      return state;
  }
}

export function useHeroState() {
  return useReducer(heroReducer, initialState);
}
