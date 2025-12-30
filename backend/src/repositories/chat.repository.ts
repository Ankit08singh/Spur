import { prisma } from '../config/prisma';
import { MessageSender } from '../utils/constants';
import type { Conversation, Message } from '../generated/prisma';

export class ConversationRepository {
  /**
   * Create a new conversation
   */
  async create(metadata?: Record<string, any>): Promise<Conversation> {
    return await prisma.conversation.create({
      data: {
        metadata: metadata || {},
      },
    });
  }

  /**
   * Get a conversation by ID with its messages
   */
  async findById(id: string, includeMessages = true): Promise<Conversation | null> {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: includeMessages ? {
          orderBy: { createdAt: 'asc' },
        } : false,
      },
    });
  }

  /**
   * Check if a conversation exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.conversation.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Delete a conversation and its messages (cascade)
   */
  async delete(id: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    });
  }
}

export class MessageRepository {
  /**
   * Create a new message in a conversation
   */
  async create(
    conversationId: string,
    sender: MessageSender,
    text: string
  ): Promise<Message> {
    return await prisma.message.create({
      data: {
        conversationId,
        sender,
        text,
      },
    });
  }

  /**
   * Get messages for a conversation with optional limit
   */
  async findByConversationId(
    conversationId: string,
    limit?: number
  ): Promise<Message[]> {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      ...(limit && { take: limit }),
    });
  }

  /**
   * Get recent conversation history (for LLM context)
   */
  async getRecentHistory(
    conversationId: string,
    limit: number
  ): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    // Return in chronological order
    return messages.reverse();
  }

  /**
   * Count messages in a conversation
   */
  async countByConversationId(conversationId: string): Promise<number> {
    return await prisma.message.count({
      where: { conversationId },
    });
  }
}

// Export singleton instances
export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
