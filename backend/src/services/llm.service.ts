import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { LLM_CONFIG, STORE_KNOWLEDGE, ERROR_MESSAGES } from '../utils/constants';
import type { Message } from '../generated/prisma';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class LLMService {
  async generateReply(
    userMessage: string,
    conversationHistory: Message[] = []
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ 
        model: LLM_CONFIG.MODEL,
        generationConfig: {
          maxOutputTokens: LLM_CONFIG.MAX_TOKENS,
          temperature: LLM_CONFIG.TEMPERATURE,
        },
      });

      const prompt = this.buildPrompt(userMessage, conversationHistory);
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const reply = response.text();

      if (!reply) {
        throw new Error('No response from LLM');
      }

      return reply.trim();
    } catch (error) {
      return this.handleLLMError(error);
    }
  }

  private buildPrompt(
    userMessage: string,
    conversationHistory: Message[]
  ): string {
    let prompt = STORE_KNOWLEDGE + '\n\n';
    
    if (conversationHistory.length > 0) {
      prompt += 'Conversation History:\n';
      conversationHistory.forEach((msg) => {
        const role = msg.sender === 'USER' ? 'Customer' : 'Agent';
        prompt += `${role}: ${msg.text}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `Customer: ${userMessage}\n`;
    prompt += 'Agent:';
    
    return prompt;
  }

  private handleLLMError(error: any): string {
    console.error('LLM API Error:', error);

    if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED') {
      return ERROR_MESSAGES.LLM_TIMEOUT;
    }

    if (error?.status === 429 || error?.message?.includes('quota')) {
      return 'Our AI is experiencing high demand. Please try again in a moment.';
    }

    if (error?.status === 401 || error?.status === 403 || error?.message?.includes('API key')) {
      console.error('Invalid Gemini API key');
      return ERROR_MESSAGES.LLM_ERROR;
    }

    if (error?.status === 500 || error?.status === 503) {
      return 'AI service is temporarily unavailable. Please try again.';
    }

    return ERROR_MESSAGES.LLM_ERROR;
  }
}

export const llmService = new LLMService();
