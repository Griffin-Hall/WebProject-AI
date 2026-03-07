import { Router } from 'express';
import destinationsRouter from './destinations.routes.js';
import searchRouter from './search.routes.js';
import matchesRouter from './matches.routes.js';
import preferencesRouter from './preferences.routes.js';
import webhooksRouter from './webhooks.routes.js';
import aiRouter from './ai.routes.js';

const router: Router = Router();

router.use('/destinations', destinationsRouter);
router.use('/search', searchRouter);
router.use('/matches', matchesRouter);
router.use('/preferences', preferencesRouter);
router.use('/webhooks', webhooksRouter);
router.use('/ai', aiRouter);

export default router;
