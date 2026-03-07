import OpenAI from 'openai';
import { env } from '../config/env.js';
import { INTENT_EXTRACTION_PROMPT } from '../utils/prompt-templates.js';
import { intentSchema } from '../validators/search.validator.js';
import { logger } from '../utils/logger.js';
import type { ExtractedIntent } from '@voyage-matcher/shared';

const openai = new OpenAI({
  baseURL: env.OLLAMA_BASE_URL,
  apiKey: env.OLLAMA_API_KEY || 'ollama', // Ollama ignores the key but SDK requires one
});

export async function extractIntent(query: string): Promise<ExtractedIntent> {
  try {
    const prompt = INTENT_EXTRACTION_PROMPT.replace('{query}', query);

    const response = await openai.chat.completions.create({
      model: env.OLLAMA_MODEL,
      temperature: 0.2,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? '';

    const parsed = JSON.parse(text);
    const validated = intentSchema.parse(parsed);

    return validated as ExtractedIntent;
  } catch (error) {
    logger.warn({ error, query }, 'Intent extraction failed, using fallback');
    return fallbackExtraction(query);
  }
}

function fallbackExtraction(query: string): ExtractedIntent {
  const lower = query.toLowerCase();

  const budget = lower.includes('cheap') || lower.includes('budget')
    ? 'budget'
    : lower.includes('luxury') || lower.includes('expensive')
      ? 'luxury'
      : lower.includes('moderate') || lower.includes('mid')
        ? 'mid'
        : null;

  const temp_pref = lower.includes('warm') || lower.includes('hot') || lower.includes('tropical')
    ? 'warm'
    : lower.includes('cold') || lower.includes('snow') || lower.includes('winter')
      ? 'cold'
      : lower.includes('mild') || lower.includes('temperate')
        ? 'mild'
        : null;

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];
  const month = monthNames.findIndex((m) => lower.includes(m));

  const vibeKeywords = [
    'romantic', 'adventure', 'beach', 'nightlife', 'cultural',
    'foodie', 'nature', 'historical', 'relaxation', 'family',
    'backpacker', 'artsy', 'spiritual', 'party', 'mountain',
  ];
  const trip_styles = vibeKeywords.filter((v) => lower.includes(v));

  return {
    budget,
    temp_pref,
    month: month >= 0 ? month + 1 : null,
    trip_styles,
    safety_priority: lower.includes('safe') ? 'high' : 'medium',
    duration_days: null,
    region_pref: null,
    vibe_description: query,
  };
}
