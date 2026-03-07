import express, { type Application } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

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

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
