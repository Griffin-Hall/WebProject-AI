import { Router } from 'express';
import * as ctrl from '../controllers/preferences.controller.js';

const router: Router = Router();

router.get('/', ctrl.getPreferences);
router.put('/', ctrl.updatePreferences);
router.get('/history', ctrl.getSearchHistory);

export default router;
