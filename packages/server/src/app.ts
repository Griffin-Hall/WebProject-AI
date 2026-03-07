import express, { type Application } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { ollamaClient } from './services/ollama.client.js';
import { seedDatabase } from './services/seed.service.js';
import { env } from './config/env.js';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'https://griffin-hall.github.io',
      ],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(generalLimiter);

  // Basic health check
  app.get('/api/health', async (_req, res) => {
    const { prisma } = await import('./config/database.js');
    const count = await prisma.destination.count().catch(() => -1);

    // Check if seed data has correct 960px URLs (diagnostic)
    let imageUrlSample: string | null = null;
    try {
      const sample = await prisma.destination.findFirst({
        where: { imageUrl: { contains: 'wikimedia' } },
        select: { city: true, imageUrl: true },
      });
      imageUrlSample = sample ? `${sample.city}: ${sample.imageUrl?.substring(sample.imageUrl.lastIndexOf('/') + 1, sample.imageUrl.lastIndexOf('/') + 20)}` : null;
    } catch { /* ignore */ }

    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      destinations: count,
      buildVersion: '2026-03-05-v2',
      imageUrlSample,
    });
  });

  // Database seed endpoint (protected by SEED_SECRET env var)
  app.post('/api/admin/seed', async (req, res) => {
    const secret = req.headers['x-seed-secret'] || req.query.secret;
    const expected = process.env.SEED_SECRET;
    if (!expected || secret !== expected) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    try {
      const result = await seedDatabase();
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Seed failed' 
      });
    }
  });

  // Ollama status check
  app.get('/api/health/ollama', async (_req, res) => {
    try {
      const isAvailable = await ollamaClient.isAvailable();
      const model = env.OLLAMA_MODEL;
      
      if (isAvailable) {
        res.json({
          status: 'available',
          model,
          baseUrl: env.OLLAMA_BASE_URL,
          message: 'Ollama is running and ready',
        });
      } else {
        res.status(503).json({
          status: 'unavailable',
          model,
          baseUrl: env.OLLAMA_BASE_URL,
          message: 'Ollama is not responding. Using fallback extraction.',
          fallback: 'Keyword-based extraction is active',
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
