/**
 * Simple logger utility with different log levels
 */
const logger = {
  /**
   * Format a log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Message to log
   * @returns {string} Formatted message
   */
  formatMessage: (level, message) => {
    return `[${level}] ${new Date().toISOString()}: ${message}`;
  },

  /**
   * Log informational message
   * @param {string} message - Message to log
   * @param {Object} [metadata] - Optional metadata
   */
  info: (message, metadata) => {
    const formattedMessage = logger.formatMessage('INFO', message);
    if (metadata) {
      console.info(formattedMessage, metadata);
    } else {
      console.info(formattedMessage);
    }
  },
  
  /**
   * Log success message
   * @param {string} message - Message to log 
   */
  success: (message) => {
    console.log('\x1b[32m%s\x1b[0m', logger.formatMessage('SUCCESS', message));
  },
  
  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {Object} [metadata] - Optional metadata
   */
  warn: (message, metadata) => {
    const formattedMessage = logger.formatMessage('WARN', message);
    if (metadata) {
      console.warn(formattedMessage, metadata);
    } else {
      console.warn(formattedMessage);
    }
  },
  
  /**
   * Log error message
   * @param {string|Error} message - Message or Error object to log
   * @param {Object} [metadata] - Optional metadata
   */
  error: (message, metadata) => {
    const formattedMessage = logger.formatMessage('ERROR', 
      message instanceof Error ? message.message : message
    );
    
    if (metadata) {
      console.error(formattedMessage, metadata);
    } else {
      console.error(formattedMessage);
    }
    
    if (message instanceof Error && message.stack) {
      console.error(message.stack);
    }
  },
  
  /**
   * Log debug message (only in development environment)
   * @param {string} message - Message to log
   */
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[35m%s\x1b[0m', logger.formatMessage('DEBUG', message));
    }
  }
};

module.exports = logger; 