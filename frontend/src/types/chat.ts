export interface Message {
  id: string;
  conversationId: string;
  sender: 'USER' | 'AI';
  text: string;
  createdAt: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    reply: string;
    sessionId: string;
  };
}

export interface HistoryResponse {
  success: boolean;
  data: {
    sessionId: string;
    messages: Message[];
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Record<string, unknown>;
  };
}
