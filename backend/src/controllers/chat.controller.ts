import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { MessageValidator } from '../validators/message.validator';

export class ChatController {
  /**
   * POST /chat/message
   * Handle incoming chat messages
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      MessageValidator.validateSendMessageRequest(req.body);

      const { message, sessionId } = req.body;

      // Process message through chat service
      const response = await chatService.sendMessage({
        message: message.trim(),
        sessionId,
      });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /chat/history/:sessionId
   * Get conversation history for a session
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      MessageValidator.validateSessionId(sessionId);

      const history = await chatService.getConversationHistory(sessionId);

      res.status(200).json({
        success: true,
        data: {
          sessionId,
          messages: history,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const chatController = new ChatController();
