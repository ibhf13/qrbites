/**
 * Simple logger utility with different log levels
 */
const logger = {
  /**
   * Log informational message
   * @param {string} message - Message to log
   */
  info: (message) => {
    console.log('\x1b[36m%s\x1b[0m', `[INFO] ${new Date().toISOString()}: ${message}`);
  },
  
  /**
   * Log success message
   * @param {string} message - Message to log 
   */
  success: (message) => {
    console.log('\x1b[32m%s\x1b[0m', `[SUCCESS] ${new Date().toISOString()}: ${message}`);
  },
  
  /**
   * Log warning message
   * @param {string} message - Message to log
   */
  warn: (message) => {
    console.log('\x1b[33m%s\x1b[0m', `[WARN] ${new Date().toISOString()}: ${message}`);
  },
  
  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error} [error] - Optional error object
   */
  error: (message, error) => {
    console.error('\x1b[31m%s\x1b[0m', `[ERROR] ${new Date().toISOString()}: ${message}`);
    if (error && error.stack) {
      console.error('\x1b[31m%s\x1b[0m', error.stack);
    }
  },
  
  /**
   * Log debug message (only in development environment)
   * @param {string} message - Message to log
   */
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[35m%s\x1b[0m', `[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  }
};

module.exports = logger; 