import { Router } from 'express';
import * as ctrl from '../controllers/matches.controller.js';

const router: Router = Router();

router.get('/', ctrl.listMatches);
router.post('/save', ctrl.saveMatch);
router.delete('/:id', ctrl.deleteMatch);

export default router;
