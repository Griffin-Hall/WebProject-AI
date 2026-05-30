import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import {
  createCompareAssistantPrompt,
  createDestinationAssistantPrompt,
} from '../utils/prompt-templates.js';
import { buildLLMCall as buildRoutedLLMCall, extractIntentWithAI } from '../services/ai-provider.service.js';

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

function getAIErrorStatus(error: unknown): number {
  return error instanceof Error && error.message.includes('No AI provider configured') ? 503 : 502;
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

    const { call: callLLM, metadata } = buildRoutedLLMCall(req);

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
      provider: metadata.provider,
      model: metadata.model,
      source: metadata.source,
      city,
      messageLength: message.length,
    });

    res.json({ success: true, data: { response, usedAI: true } });
  } catch (error) {
    logger.warn({ error }, 'AI chat failed');
    const msg = error instanceof Error ? error.message : 'AI request failed';
    res.status(getAIErrorStatus(error)).json({ success: false, error: msg });
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

    const { call: callLLM, metadata } = buildRoutedLLMCall(req);
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
      provider: metadata.provider,
      model: metadata.model,
      source: metadata.source,
      destinationCount: sanitizedDestinations.length,
      messageLength: message.length,
    });

    res.json({ success: true, data: { response, usedAI: true } });
  } catch (error) {
    logger.warn({ error }, 'AI compare failed');
    const msg = error instanceof Error ? error.message : 'AI compare request failed';
    res.status(getAIErrorStatus(error)).json({ success: false, error: msg });
  }
}

/**
 * POST /api/ai/test — Test API key connectivity
 * 
 * Headers: X-AI-API-Key, X-AI-Provider, X-AI-Model
 */
export async function handleAITest(req: Request, res: Response, next: NextFunction) {
  try {
    const { call: callLLM, metadata } = buildRoutedLLMCall(req);

    const response = await callLLM([
      { role: 'system', content: 'You are a helpful assistant. Respond with exactly: "GlobeSense AI connected successfully!"' },
      { role: 'user', content: 'Say hello.' },
    ], {
      temperature: 0,
      max_tokens: 50,
    });

    logger.info({
      msg: 'AI API key test successful',
      provider: metadata.provider,
      model: metadata.model,
      source: metadata.source,
    });

    res.json({
      success: true,
      message: `Connected! Model responded: "${response.slice(0, 80)}"`,
      data: {
        provider: metadata.provider,
        model: metadata.model,
        source: metadata.source,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Connection failed';
    logger.warn({ error }, 'AI API key test failed');
    res.status(getAIErrorStatus(error)).json({ success: false, error: msg });
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

    const apiKey = req.headers['x-ai-api-key'] as string | undefined;
    
    if (apiKey) {
      const { intent, metadata } = await extractIntentWithAI(req, query);

      logger.info({
        msg: 'Intent extracted via user API key',
        provider: metadata.provider,
        model: metadata.model,
        source: metadata.source,
        query: query.slice(0, 50),
      });

      res.json({ success: true, data: intent });
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
