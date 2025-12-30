import type { Message } from '../types/chat';
import { renderFormattedText } from '../utils/textFormatter';
import './ChatMessage.css';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'USER';
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedContent = isUser ? message.text : renderFormattedText(message.text);

  return (
    <div className={`chat-message ${isUser ? 'user' : 'ai'}`}>
      <div className="message-content">
        <div className="message-text">
          {isUser ? <p>{formattedContent}</p> : formattedContent}
        </div>
        <span className="message-time">{timestamp}</span>
      </div>
    </div>
  );
}
