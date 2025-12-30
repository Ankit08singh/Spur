import { conversationRepository, messageRepository } from '../repositories/chat.repository';
import { llmService } from './llm.service';
import { MessageSender, VALIDATION, ERROR_MESSAGES } from '../utils/constants';
import type { Conversation, Message } from '../generated/prisma';

interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

interface SendMessageResponse {
  reply: string;
  sessionId: string;
  conversationHistory?: Message[];
}

export class ChatService {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const { message, sessionId } = request;

    let conversation: Conversation;
    
    if (sessionId) {
      const existing = await conversationRepository.findById(sessionId, false);
      
      if (!existing) {
        throw new Error(ERROR_MESSAGES.INVALID_SESSION);
      }
      
      conversation = existing;
    } else {
      conversation = await conversationRepository.create();
    }

    // Save user message
    await messageRepository.create(
      conversation.id,
      MessageSender.USER,
      message
    );

    // Get recent conversation history for context
    const history = await messageRepository.getRecentHistory(
      conversation.id,
      VALIDATION.MAX_HISTORY_MESSAGES
    );

    // Generate AI reply using LLM
    const aiReply = await llmService.generateReply(message, history);

    // Save AI message
    await messageRepository.create(
      conversation.id,
      MessageSender.AI,
      aiReply
    );

    return {
      reply: aiReply,
      sessionId: conversation.id,
    };
  }

  async getConversationHistory(sessionId: string): Promise<Message[]> {
    const conversation = await conversationRepository.findById(sessionId, true) as any;
    
    if (!conversation) {
      throw new Error(ERROR_MESSAGES.INVALID_SESSION);
    }

    return conversation.messages || [];
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    return await conversationRepository.exists(sessionId);
  }
}

export const chatService = new ChatService();
