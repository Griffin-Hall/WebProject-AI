import { Request, Response, NextFunction } from 'express';
import { search } from '../services/search.service.js';
import { searchRequestSchema } from '../validators/search.validator.js';
import { logger } from '../utils/logger.js';

export async function handleSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = searchRequestSchema.parse(req.body);
    const userId = (req as any).auth?.userId ?? undefined;

    // Check if client sent a user-provided AI key
    const userApiKey = req.headers['x-ai-api-key'] as string | undefined;
    const userProvider = req.headers['x-ai-provider'] as string | undefined;
    const userModel = req.headers['x-ai-model'] as string | undefined;

    let results;

    if (userApiKey) {
      // Use user's API key for AI-powered intent extraction
      logger.info({ 
        msg: 'Search with user-provided AI key',
        provider: userProvider,
        model: userModel,
        query: query.slice(0, 50),
      });

      // Extract intent via the AI intent endpoint logic
      const { INTENT_EXTRACTION_PROMPT } = await import('../utils/prompt-templates.js');
      const { intentSchema } = await import('../validators/search.validator.js');

      try {
        const intent = await extractIntentWithUserKey(
          query,
          userApiKey,
          userProvider || 'openai',
          userModel || 'gpt-4o-mini'
        );
        
        // Run the matching with the extracted intent
        const { findAndRankDestinations } = await import('../services/matching.service.js');
        const matchResults = await findAndRankDestinations(intent);

        results = {
          query,
          intent,
          results: matchResults.results,
          totalCandidates: matchResults.totalCandidates,
        };
      } catch (aiError) {
        logger.warn({ aiError }, 'User API key intent extraction failed, falling back to standard search');
        results = await search(query, userId);
      }
    } else {
      results = await search(query, userId);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}

/**
 * Extract intent using a user-provided API key
 */
async function extractIntentWithUserKey(
  query: string,
  apiKey: string,
  provider: string,
  model: string,
) {
  const { INTENT_EXTRACTION_PROMPT } = await import('../utils/prompt-templates.js');
  const { intentSchema } = await import('../validators/search.validator.js');
  
  const prompt = INTENT_EXTRACTION_PROMPT.replace('{query}', query);

  const baseUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
    kimi: 'https://api.moonshot.ai/v1',
  };
  const baseUrl = baseUrls[provider] || baseUrls.openai;

  let responseText: string;

  if (provider === 'anthropic') {
    const res = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        system: 'You are a precise intent extraction engine. Return only valid JSON.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
    const data = await res.json();
    responseText = data.content?.[0]?.text || '';
  } else {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://griffin-hall.github.io/WebProject-AI/';
      headers['X-Title'] = 'GlobeSense Travel AI';
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise intent extraction engine. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
        ...(provider !== 'openrouter' ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`LLM API ${res.status}`);
    const data = await res.json();
    responseText = data.choices?.[0]?.message?.content || '';
  }

  const parsed = JSON.parse(responseText);
  return intentSchema.parse(parsed);
}
