import { useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import './ChatWindow.css';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onChipClick?: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onChipClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>Start Your Conversation</h2>
          <p>Ask me anything about our store!</p>
          <div className="suggestion-chips">
            <div className="chip" onClick={() => onChipClick?.('What is your return policy?')}>
              What's your return policy?
            </div>
            <div className="chip" onClick={() => onChipClick?.('Do you ship to Canada?')}>
              Do you ship to Canada?
            </div>
            <div className="chip" onClick={() => onChipClick?.('What are your support hours?')}>
              What are your support hours?
            </div>
          </div>
        </div>
      ) : (
        <div className="messages-container" ref={containerRef}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
