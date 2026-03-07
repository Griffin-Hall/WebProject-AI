import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import {
  createCompareAssistantPrompt,
  createDestinationAssistantPrompt,
} from '../utils/prompt-templates.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompareDestinationInput {
  id?: string;
  city: string;
  country: string;
  continent: string;
  tags?: string[];
  safetyScore?: number | null;
  advisoryLevel?: string | null;
  dailyBudgetLow?: number | null;
  dailyBudgetMid?: number | null;
  dailyBudgetHigh?: number | null;
  weather?: Array<{
    month: number;
    avgTempC: number;
    avgRainfallMm?: number;
    sunshineHours?: number;
  }>;
}

/**
 * Build an OpenAI-compatible LLM client from per-request headers.
 * Supports OpenAI, Anthropic (via Messages → OpenAI shim), and OpenRouter.
 */
function buildLLMCall(req: Request) {
  const apiKey = req.headers['x-ai-api-key'] as string | undefined;
  const provider = (req.headers['x-ai-provider'] as string) || 'openai';
  const model = (req.headers['x-ai-model'] as string) || 'gpt-4o-mini';

  if (!apiKey) throw new Error('No API key provided');

  const baseUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
    kimi: 'https://api.moonshot.ai/v1',
  };

  const baseUrl = baseUrls[provider] || baseUrls.openai;

  return async (messages: ChatMessage[], options: { temperature?: number; max_tokens?: number } = {}): Promise<string> => {
    if (provider === 'anthropic') {
      // Anthropic Messages API (different format)
      const systemMsg = messages.find(m => m.role === 'system');
      const nonSystemMsgs = messages.filter(m => m.role !== 'system');

      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options.max_tokens || 1024,
          system: systemMsg?.content || '',
          messages: nonSystemMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const error = await response.text().catch(() => 'Unknown error');
        throw new Error(`Anthropic API ${response.status}: ${error}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text || '';
    }

    // OpenAI-compatible (OpenAI, OpenRouter, etc.)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // OpenRouter requires extra headers
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://griffin-hall.github.io/WebProject-AI/';
      headers['X-Title'] = 'GlobeSense Travel AI';
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      throw new Error(`LLM API ${response.status}: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  };
}

/**
 * POST /api/ai/chat — Destination-specific chat
 * 
 * Body: { city, country, message, tags?, safetyScore?, dailyBudgetMid? }
 * Headers: X-AI-API-Key, X-AI-Provider, X-AI-Model
 */
export async function handleAIChat(req: Request, res: Response, next: NextFunction) {
  try {
    const { city, country, message, tags, safetyScore, dailyBudgetMid, continent } = req.body;

    if (!city || !message) {
      res.status(400).json({ success: false, error: 'city and message are required' });
      return;
    }

    const callLLM = buildLLMCall(req);

    // Build destination-aware system prompt
    const systemPrompt = createDestinationAssistantPrompt(
      city,
      {
        country: country || 'Unknown',
        continent: continent || 'Unknown',
        tags: tags || [],
        safetyScore,
        dailyBudgetMid,
      },
      message
    );

    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ], {
      temperature: 0.7,
      max_tokens: 800,
    });

    logger.info({
      msg: 'AI chat response generated',
      provider: req.headers['x-ai-provider'],
      model: req.headers['x-ai-model'],
      city,
      messageLength: message.length,
    });

    res.json({ success: true, data: { response, usedAI: true } });
  } catch (error) {
    logger.warn({ error }, 'AI chat failed');
    const msg = error instanceof Error ? error.message : 'AI request failed';
    res.status(502).json({ success: false, error: msg });
  }
}

/**
 * POST /api/ai/compare — Multi-destination compare assistant
 *
 * Body: { message, destinations[] }
 * Headers: X-AI-API-Key, X-AI-Provider, X-AI-Model
 */
export async function handleAICompare(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, destinations } = req.body as {
      message?: string;
      destinations?: CompareDestinationInput[];
    };

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, error: 'message is required' });
      return;
    }

    if (!Array.isArray(destinations) || destinations.length < 2) {
      res.status(400).json({ success: false, error: 'at least 2 destinations are required' });
      return;
    }

    const sanitizedDestinations = destinations.slice(0, 4).map((destination) => ({
      city: destination.city,
      country: destination.country,
      continent: destination.continent,
      tags: destination.tags ?? [],
      safetyScore: destination.safetyScore ?? null,
      advisoryLevel: destination.advisoryLevel ?? null,
      dailyBudgetLow: destination.dailyBudgetLow ?? null,
      dailyBudgetMid: destination.dailyBudgetMid ?? null,
      dailyBudgetHigh: destination.dailyBudgetHigh ?? null,
      weather: Array.isArray(destination.weather)
        ? destination.weather
            .filter((entry) => Number.isFinite(entry.month) && Number.isFinite(entry.avgTempC))
            .map((entry) => ({
              month: entry.month,
              avgTempC: entry.avgTempC,
              avgRainfallMm: entry.avgRainfallMm,
              sunshineHours: entry.sunshineHours,
            }))
        : [],
    }));

    const callLLM = buildLLMCall(req);
    const systemPrompt = createCompareAssistantPrompt(sanitizedDestinations, message.trim());

    const response = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.trim() },
      ],
      {
        temperature: 0.45,
        max_tokens: 900,
      },
    );

    logger.info({
      msg: 'AI compare response generated',
      provider: req.headers['x-ai-provider'],
      model: req.headers['x-ai-model'],
      destinationCount: sanitizedDestinations.length,
      messageLength: message.length,
    });

    res.json({ success: true, data: { response, usedAI: true } });
  } catch (error) {
    logger.warn({ error }, 'AI compare failed');
    const msg = error instanceof Error ? error.message : 'AI compare request failed';
    res.status(502).json({ success: false, error: msg });
  }
}

/**
 * POST /api/ai/test — Test API key connectivity
 * 
 * Headers: X-AI-API-Key, X-AI-Provider, X-AI-Model
 */
export async function handleAITest(req: Request, res: Response, next: NextFunction) {
  try {
    const callLLM = buildLLMCall(req);

    const response = await callLLM([
      { role: 'system', content: 'You are a helpful assistant. Respond with exactly: "GlobeSense AI connected successfully!"' },
      { role: 'user', content: 'Say hello.' },
    ], {
      temperature: 0,
      max_tokens: 50,
    });

    logger.info({
      msg: 'AI API key test successful',
      provider: req.headers['x-ai-provider'],
      model: req.headers['x-ai-model'],
    });

    res.json({ success: true, message: `Connected! Model responded: "${response.slice(0, 80)}"` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Connection failed';
    logger.warn({ error }, 'AI API key test failed');
    res.status(400).json({ success: false, error: msg });
  }
}

/**
 * POST /api/ai/intent — Extract intent using user-provided API key
 * 
 * Body: { query }
 * Headers: X-AI-API-Key, X-AI-Provider, X-AI-Model
 */
export async function handleAIIntent(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ success: false, error: 'query is required' });
      return;
    }

    // If user provided an API key, use it for intent extraction
    const apiKey = req.headers['x-ai-api-key'] as string | undefined;
    
    if (apiKey) {
      const { INTENT_EXTRACTION_PROMPT } = await import('../utils/prompt-templates.js');
      const callLLM = buildLLMCall(req);
      const prompt = INTENT_EXTRACTION_PROMPT.replace('{query}', query);

      const response = await callLLM([
        { role: 'system', content: 'You are a precise intent extraction engine. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ], {
        temperature: 0.2,
        max_tokens: 500,
      });

      const { intentSchema } = await import('../validators/search.validator.js');
      const parsed = JSON.parse(response);
      const validated = intentSchema.parse(parsed);

      logger.info({
        msg: 'Intent extracted via user API key',
        provider: req.headers['x-ai-provider'],
        query: query.slice(0, 50),
      });

      res.json({ success: true, data: validated });
    } else {
      // Fallback: use server-side extraction (env key or keyword fallback)
      const { extractIntent } = await import('../services/intent.service.js');
      const intent = await extractIntent(query);
      res.json({ success: true, data: intent });
    }
  } catch (error) {
    next(error);
  }
}
