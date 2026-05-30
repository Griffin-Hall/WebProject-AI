import { Request, Response, NextFunction } from 'express';
import { search } from '../services/search.service.js';
import { findAndRankDestinations } from '../services/matching.service.js';
import { extractIntentWithAI } from '../services/ai-provider.service.js';
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

      try {
        const { intent, metadata } = await extractIntentWithAI(req, query);
        
        // Run the matching with the extracted intent
        const matchResults = await findAndRankDestinations(intent);

        logger.info({
          msg: 'Search intent extracted via request AI provider',
          provider: metadata.provider,
          model: metadata.model,
          source: metadata.source,
          query: query.slice(0, 50),
        });

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
