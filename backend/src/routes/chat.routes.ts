import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

/**
 * POST /chat/message
 * Send a message and get AI reply
 * Body: { message: string, sessionId?: string }
 */
router.post('/message', (req, res, next) => chatController.sendMessage(req, res, next));

/**
 * GET /chat/history/:sessionId
 * Get conversation history for a session
 */
router.get('/history/:sessionId', (req, res, next) => chatController.getHistory(req, res, next));

export default router;
