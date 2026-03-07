import { INTENT_EXTRACTION_PROMPT, GLOBAL_SYSTEM_PROMPT } from '../utils/prompt-templates.js';
import { intentSchema } from '../validators/search.validator.js';
import { logger } from '../utils/logger.js';
import { llmClient } from './llm.client.js';
import { ollamaClient } from './ollama.client.js';
import type { ExtractedIntent } from '@voyage-matcher/shared';

/**
 * Extract travel intent from natural language query.
 * 
 * Priority order for AI processing:
 * 1. Hosted LLM API (OpenAI-compatible) - if LLM_API_KEY is configured
 * 2. Local Ollama instance - if available
 * 3. Fallback to keyword-based extraction
 * 
 * This ensures the best available AI is used while maintaining
 * reliability through graceful degradation.
 */
export async function extractIntent(query: string): Promise<ExtractedIntent> {
  // Track which method was used for telemetry
  let methodUsed: 'hosted-llm' | 'ollama' | 'fallback' = 'fallback';

  // Try 1: Hosted LLM API (OpenAI-compatible)
  if (llmClient.isConfigured()) {
    try {
      const prompt = INTENT_EXTRACTION_PROMPT.replace('{query}', query);
      
      const response = await llmClient.chat([
        { role: 'system', content: 'You are a precise intent extraction engine. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const parsed = JSON.parse(response);
      const validated = intentSchema.parse(parsed);

      methodUsed = 'hosted-llm';
      logger.info({ 
        msg: 'Intent extracted via hosted LLM API',
        method: methodUsed,
        query: query.slice(0, 50),
        budget: validated.budget,
        temp_pref: validated.temp_pref,
        month: validated.month,
        trip_styles_count: validated.trip_styles?.length || 0
      });

      return validated as ExtractedIntent;
    } catch (error) {
      logger.warn({ 
        error, 
        query 
      }, 'Hosted LLM intent extraction failed, trying Ollama');
    }
  }

  // Try 2: Local Ollama instance
  try {
    const isOllamaAvailable = await ollamaClient.isAvailable();
    
    if (isOllamaAvailable) {
      const prompt = INTENT_EXTRACTION_PROMPT.replace('{query}', query);
      
      const response = await ollamaClient.chat([
        { role: 'user', content: prompt }
      ], {
        temperature: 0.2,
        max_tokens: 500,
      });

      const parsed = JSON.parse(response);
      const validated = intentSchema.parse(parsed);

      methodUsed = 'ollama';
      logger.info({ 
        msg: 'Intent extracted via Ollama',
        method: methodUsed,
        query: query.slice(0, 50),
        budget: validated.budget,
        temp_pref: validated.temp_pref,
        month: validated.month,
        trip_styles_count: validated.trip_styles?.length || 0
      });

      return validated as ExtractedIntent;
    } else {
      logger.warn('Ollama not available, using fallback extraction');
    }
  } catch (error) {
    logger.warn({ 
      error, 
      query 
    }, 'Ollama intent extraction failed, using fallback');
  }

  // Fallback to keyword-based extraction
  methodUsed = 'fallback';
  return fallbackExtraction(query);
}

/**
 * Generate AI-powered chat response for destination queries
 * 
 * Uses the global system prompt and hosted LLM API if available,
 * with fallback to keyword-based responses
 */
export async function generateChatResponse(
  userMessage: string,
  context?: {
    currentDestination?: string;
    previousDestinations?: string[];
  }
): Promise<{ response: string; usedAI: boolean }> {
  // Try hosted LLM first
  if (llmClient.isConfigured()) {
    try {
      let systemPrompt = GLOBAL_SYSTEM_PROMPT;
      
      if (context?.currentDestination) {
        systemPrompt += `\n\nThe user is asking about ${context.currentDestination}. Tailor your response specifically to this destination.`;
      }

      const response = await llmClient.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ], {
        temperature: 0.7,
        max_tokens: 800,
      });

      logger.info({ 
        msg: 'Chat response generated via hosted LLM',
        destination: context?.currentDestination,
        messageLength: userMessage.length
      });

      return { response, usedAI: true };
    } catch (error) {
      logger.warn({ error }, 'Hosted LLM chat failed');
    }
  }

  // Fallback: Generate a simple response
  const fallbackResponse = generateFallbackChatResponse(userMessage, context);
  return { response: fallbackResponse, usedAI: false };
}

/**
 * Generate a simple fallback response when AI is unavailable
 */
function generateFallbackChatResponse(
  userMessage: string,
  context?: { currentDestination?: string }
): string {
  const destination = context?.currentDestination;
  
  if (destination) {
    return `I'd be happy to help you learn more about ${destination}! However, our AI assistant is currently offline. 

In the meantime, you can:
- Browse the destination details above for weather, cost, and safety information
- Check out similar destinations in our database
- Try your search again in a few minutes when AI services are restored

Is there something specific about ${destination} you'd like to know? I'll do my best to assist with the information available.`;
  }

  return `Thanks for your message! Our AI travel assistant is currently offline, but you can still:

- Use the search bar to find destinations by describing your ideal trip
- Browse destinations by continent in our explorer
- Check back soon when AI services are restored

How else can I help you plan your travels?`;
}

// Maps user-facing synonyms → canonical VIBE_TAGS
const SYNONYM_MAP: Record<string, string[]> = {
  ski: ['winter-sports', 'mountain', 'adventure'],
  skiing: ['winter-sports', 'mountain', 'adventure'],
  snowboard: ['winter-sports', 'mountain', 'adventure'],
  snowboarding: ['winter-sports', 'mountain', 'adventure'],
  snow: ['winter-sports', 'mountain'],
  winter: ['winter-sports'],
  wonderland: ['nature'],
  hike: ['adventure', 'mountain', 'nature'],
  hiking: ['adventure', 'mountain', 'nature'],
  trek: ['adventure', 'mountain', 'nature'],
  trekking: ['adventure', 'mountain', 'nature'],
  surf: ['beach', 'adventure'],
  surfing: ['beach', 'adventure'],
  scuba: ['beach', 'adventure', 'nature'],
  diving: ['beach', 'adventure', 'nature'],
  yoga: ['spiritual', 'relaxation'],
  meditation: ['spiritual', 'relaxation'],
  temple: ['historical', 'cultural', 'spiritual'],
  temples: ['historical', 'cultural', 'spiritual'],
  ruins: ['historical', 'cultural'],
  museum: ['historical', 'cultural'],
  museums: ['historical', 'cultural'],
  cuisine: ['foodie'],
  food: ['foodie'],
  dining: ['foodie'],
  restaurant: ['foodie'],
  club: ['nightlife', 'party'],
  clubbing: ['nightlife', 'party'],
  bars: ['nightlife', 'party'],
  dancing: ['nightlife', 'party'],
  wildlife: ['nature', 'eco-friendly'],
  safari: ['nature', 'adventure'],
  jungle: ['nature', 'adventure', 'eco-friendly'],
  rainforest: ['nature', 'eco-friendly'],
  city: ['urban'],
  metropolitan: ['urban'],
  cosmopolitan: ['urban'],
  kids: ['family-friendly'],
  children: ['family-friendly'],
  family: ['family-friendly'],
  romantic: ['romantic'],
  honeymoon: ['romantic', 'luxury'],
  adventure: ['adventure'],
  beach: ['beach'],
  mountain: ['mountain'],
  mountains: ['mountain'],
  alpine: ['mountain', 'winter-sports'],
  backpack: ['backpacker'],
  backpacking: ['backpacker'],
  art: ['artsy', 'cultural'],
  gallery: ['artsy', 'cultural'],
  luxury: ['luxury'],
  spa: ['luxury', 'relaxation'],
  relax: ['relaxation'],
  relaxing: ['relaxation'],
  peaceful: ['relaxation', 'nature'],
  offbeat: ['off-the-beaten-path'],
  hidden: ['off-the-beaten-path'],
  undiscovered: ['off-the-beaten-path'],
  eco: ['eco-friendly', 'nature'],
  sustainable: ['eco-friendly'],
  nature: ['nature'],
  nightlife: ['nightlife'],
  cultural: ['cultural'],
  historical: ['historical'],
  spiritual: ['spiritual'],
  party: ['party'],
  foodie: ['foodie'],
  artsy: ['artsy'],
  urban: ['urban'],
};

/**
 * Keyword-based fallback extraction when AI is unavailable.
 * Fast, reliable, and works offline.
 */
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
    : lower.includes('cold') || lower.includes('snow') || lower.includes('winter') || lower.includes('ski')
      ? 'cold'
      : lower.includes('mild') || lower.includes('temperate')
        ? 'mild'
        : null;

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];
  const month = monthNames.findIndex((m) => lower.includes(m));

  // Build trip_styles from synonym map
  const tagSet = new Set<string>();
  const words = lower.split(/\W+/);
  for (const word of words) {
    const mapped = SYNONYM_MAP[word];
    if (mapped) {
      mapped.forEach((tag) => tagSet.add(tag));
    }
  }
  const trip_styles = Array.from(tagSet);

  // Extract region preference
  const regions = ['europe', 'asia', 'africa', 'north america', 'south america', 'oceania', 'australia', 'middle east'];
  const region_pref = regions.find(r => lower.includes(r)) || null;

  logger.info({
    msg: 'Intent extracted via fallback',
    query: query.slice(0, 50),
    budget,
    temp_pref,
    month: month >= 0 ? month + 1 : null,
    trip_styles_count: trip_styles.length,
    region_pref
  });

  return {
    budget,
    temp_pref,
    month: month >= 0 ? month + 1 : null,
    trip_styles,
    safety_priority: lower.includes('safe') ? 'high' : 'medium',
    duration_days: null,
    region_pref,
    vibe_description: query,
  };
}
