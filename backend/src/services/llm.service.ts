import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { LLM_CONFIG, STORE_KNOWLEDGE, ERROR_MESSAGES } from '../utils/constants';
import type { Message } from '../generated/prisma';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class LLMService {
  /**
   * Generate AI response using Gemini API
   */
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

      // Build the full prompt with context
      const prompt = this.buildPrompt(userMessage, conversationHistory);
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const reply = response.text();

      console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
      console.log(reply);
      console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
      console.log(reply.trim());
      console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");


      
      if (!reply) {
        throw new Error('No response from LLM');
      }

      return reply.trim();
    } catch (error) {
      return this.handleLLMError(error);
    }
  }

  /**
   * Build the prompt with system instructions and conversation history
   */
  private buildPrompt(
    userMessage: string,
    conversationHistory: Message[]
  ): string {
    let prompt = STORE_KNOWLEDGE + '\n\n';
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      prompt += 'Conversation History:\n';
      conversationHistory.forEach((msg) => {
        const role = msg.sender === 'USER' ? 'Customer' : 'Agent';
        prompt += `${role}: ${msg.text}\n`;
      });
      prompt += '\n';
    }
    
    // Add current user message
    prompt += `Customer: ${userMessage}\n`;
    prompt += 'Agent:';
    
    return prompt;
  }

  /**
   * Handle LLM API errors gracefully
   */
  private handleLLMError(error: any): string {
    console.error('LLM API Error:', error);

    // Handle specific Gemini errors
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

    // Generic error
    return ERROR_MESSAGES.LLM_ERROR;
  }
}

// Export singleton instance
export const llmService = new LLMService();
