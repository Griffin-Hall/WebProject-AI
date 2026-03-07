import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';
import { ollamaClient } from './services/ollama.client.js';
import { prisma } from './config/database.js';
import { seedDatabase } from './services/seed.service.js';
import { env } from './config/env.js';

async function main() {
  const app = createApp();
  const port = env.PORT;

  // Always run seed on startup to keep DB in sync with destinations.json
  // Uses upsert, so existing records get updated (e.g. fixed image URLs)
  try {
    const count = await prisma.destination.count();
    logger.info(`Database has ${count} destinations, running sync seed...`);
    const result = await seedDatabase();
    logger.info(`Seed complete: ${result.seeded} synced, ${result.total} total`);

    // Verify image URLs were updated
    const wikiSample = await prisma.destination.findFirst({
      where: { imageUrl: { contains: 'wikimedia' } },
      select: { city: true, imageUrl: true },
    });
    if (wikiSample) {
      const has960 = wikiSample.imageUrl?.includes('/960px-');
      logger.info(`Image URL check: ${wikiSample.city} → ${has960 ? '960px ✓' : 'NOT 960px ✗'} (${wikiSample.imageUrl?.substring(wikiSample.imageUrl.lastIndexOf('/') + 1)})`);
    }
  } catch (error) {
    logger.warn({ error }, 'Seed sync failed (database may not be ready)');
  }

  // Check Ollama connection on startup
  logger.info('Checking Ollama connection...');
  try {
    const isAvailable = await ollamaClient.isAvailable();
    if (isAvailable) {
      logger.info(`✓ Ollama connected (${env.OLLAMA_MODEL})`);
      logger.info(`  Base URL: ${env.OLLAMA_BASE_URL}`);
    } else {
      logger.warn('✗ Ollama not available');
      logger.warn(`  Tried: ${env.OLLAMA_BASE_URL}`);
      logger.warn('  Will use keyword-based fallback for intent extraction');
      logger.info('  To enable AI: ollama serve');
    }
  } catch (error) {
    logger.error({ msg: 'Failed to check Ollama', error });
  }

  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
    logger.info(`Health check: http://localhost:${port}/api/health`);
    logger.info(`Ollama status: http://localhost:${port}/api/health/ollama`);
  });
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
