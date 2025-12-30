import type {
  SendMessageRequest,
  SendMessageResponse,
  HistoryResponse,
  ErrorResponse,
} from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const chatAPI = {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('[API] Sending message:', request);
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        console.error('[API] Error response:', error);
        throw new Error(error.error?.message || 'Failed to send message');
      }

      const data = await response.json();
      console.log('[API] Response received:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getHistory(sessionId: string): Promise<HistoryResponse> {
    try {
      console.log('[API] Fetching history for session:', sessionId);
      const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        console.error('[API] Error fetching history:', error);
        throw new Error(error.error?.message || 'Failed to fetch history');
      }

      const data = await response.json();
      console.log('[API] History received:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
