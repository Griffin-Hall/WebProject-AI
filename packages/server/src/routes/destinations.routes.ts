import { Router } from 'express';
import * as ctrl from '../controllers/destinations.controller.js';

const router: Router = Router();

router.get('/', ctrl.listDestinations);
router.get('/featured', ctrl.getFeatured);
router.get('/:id', ctrl.getDestination);

export default router;
