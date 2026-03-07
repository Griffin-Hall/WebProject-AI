import { Router } from 'express';
import { handleSearch } from '../controllers/search.controller.js';
import { searchLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { searchRequestSchema } from '../validators/search.validator.js';

const router: Router = Router();

router.post('/', searchLimiter, validate(searchRequestSchema), handleSearch);

export default router;
