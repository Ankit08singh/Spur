import { prisma } from '../config/prisma';
import { MessageSender } from '../utils/constants';
import type { Conversation, Message } from '../generated/prisma';

export class ConversationRepository {
  async create(metadata?: Record<string, any>): Promise<Conversation> {
    return await prisma.conversation.create({
      data: {
        metadata: metadata || {},
      },
    });
  }

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

  async exists(id: string): Promise<boolean> {
    const count = await prisma.conversation.count({
      where: { id },
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    });
  }
}

export class MessageRepository {
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

  async getRecentHistory(
    conversationId: string,
    limit: number
  ): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return messages.reverse();
  }

  async countByConversationId(conversationId: string): Promise<number> {
    return await prisma.message.count({
      where: { conversationId },
    });
  }
}

export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
