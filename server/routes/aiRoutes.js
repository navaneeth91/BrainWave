import express from 'express';
import { aiChat } from '../controllers/aiController.js';
import { aiRateLimiter } from '../middlewares/rateLimiter.js';

const aiRouter = express.Router();

// POST /api/ai/chat
aiRouter.post('/chat', aiRateLimiter, aiChat);

export default aiRouter;
