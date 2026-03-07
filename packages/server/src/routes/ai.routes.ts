import { Router } from 'express';
import {
  handleAIChat,
  handleAICompare,
  handleAITest,
  handleAIIntent,
} from '../controllers/ai.controller.js';

const router: Router = Router();

// POST /api/ai/chat — Destination-specific AI chat
router.post('/chat', handleAIChat);

// POST /api/ai/compare — Multi-destination compare assistant
router.post('/compare', handleAICompare);

// POST /api/ai/test — Test API key connectivity
router.post('/test', handleAITest);

// POST /api/ai/intent — Extract intent with user's API key
router.post('/intent', handleAIIntent);

export default router;
