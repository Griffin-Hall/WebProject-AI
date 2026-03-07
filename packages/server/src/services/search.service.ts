import { extractIntent } from './intent.service.js';
import { findAndRankDestinations } from './matching.service.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import type { SearchResponse } from '@voyage-matcher/shared';

export async function search(query: string, userId?: string): Promise<SearchResponse> {
  logger.info({ query }, 'Processing search');

  const intent = await extractIntent(query);
  logger.info({ intent }, 'Extracted intent');

  const { results, totalCandidates } = await findAndRankDestinations(intent);

  if (userId) {
    try {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        await prisma.searchHistory.create({
          data: {
            userId: user.id,
            query,
            extractedIntent: intent as any,
            resultsCount: results.length,
          },
        });
      }
    } catch (error) {
      logger.warn({ error }, 'Failed to save search history');
    }
  }

  return {
    query,
    intent,
    results,
    totalCandidates,
  };
}
