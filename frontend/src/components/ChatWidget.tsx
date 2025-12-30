import { useState, useEffect } from 'react';
import type { Message } from '../types/chat';
import { chatAPI } from '../services/api';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import './ChatWidget.css';

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await chatAPI.checkHealth();
      setIsConnected(connected);
      if (!connected) {
        setError('Unable to connect to chat service. Please refresh the page.');
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadHistory(savedSessionId);
    }
  }, []);

  const loadHistory = async (sid: string) => {
    try {
      const response = await chatAPI.getHistory(sid);
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: sessionId || '',
        sender: 'USER',
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      console.log('[Chat] Sending message to backend:', text);
      const response = await chatAPI.sendMessage({
        message: text,
        sessionId: sessionId || undefined,
      });

      if (!sessionId) {
        console.log('[Chat] New conversation created with sessionId:', response.data.sessionId);
        setSessionId(response.data.sessionId);
        localStorage.setItem('chatSessionId', response.data.sessionId);
      }

      // Add AI response
      console.log('[Chat] AI Reply received:', response.data.reply);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        conversationId: response.data.sessionId,
        sender: 'AI',
        text: response.data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('[Chat] Error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    setError(null);
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="header-content">
          <h1>TechStyle Support</h1>
          <p className="status">
            {isConnected ? (
              <>
                <span className="status-dot online"></span>
                AI Agent Ready
              </>
            ) : (
              <>
                <span className="status-dot offline"></span>
                Offline
              </>
            )}
          </p>
        </div>
        {sessionId && (
          <button className="new-chat-btn" onClick={handleNewConversation}>
            New Chat
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <ChatWindow 
        messages={messages} 
        isLoading={isLoading}
        onChipClick={handleSendMessage}
      />

      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        disabled={!isConnected}
      />
    </div>
  );
};
