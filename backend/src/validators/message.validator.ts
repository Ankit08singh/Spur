import { VALIDATION, ERROR_MESSAGES } from '../utils/constants';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

export class MessageValidator {
  /**
   * Validate chat message input
   */
  static validateMessage(message: string): void {
    const errors: ValidationError[] = [];

    // Check if message is empty or only whitespace
    if (!message || message.trim().length === 0) {
      errors.push({
        field: 'message',
        message: ERROR_MESSAGES.EMPTY_MESSAGE,
      });
    }

    // Check message length
    if (message && message.length > VALIDATION.MAX_MESSAGE_LENGTH) {
      errors.push({
        field: 'message',
        message: `${ERROR_MESSAGES.MESSAGE_TOO_LONG} (max ${VALIDATION.MAX_MESSAGE_LENGTH} characters)`,
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  /**
   * Validate session ID format (CUID format check)
   */
  static validateSessionId(sessionId?: string): void {
    if (sessionId && typeof sessionId !== 'string') {
      throw new ValidationException([
        {
          field: 'sessionId',
          message: 'Session ID must be a string',
        },
      ]);
    }

    // Basic CUID format check (starts with 'c', alphanumeric)
    if (sessionId && !/^c[a-z0-9]{24}$/.test(sessionId)) {
      throw new ValidationException([
        {
          field: 'sessionId',
          message: ERROR_MESSAGES.INVALID_SESSION,
        },
      ]);
    }
  }

  /**
   * Validate entire send message request
   */
  static validateSendMessageRequest(body: any): void {
    const { message, sessionId } = body;

    this.validateMessage(message);
    
    if (sessionId !== undefined) {
      this.validateSessionId(sessionId);
    }
  }
}
