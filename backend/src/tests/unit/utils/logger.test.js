const logger = require('../../../utils/logger');

describe('Logger Utility', () => {
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      const message = 'Test info message';
      logger.info(message);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should log info messages with metadata', () => {
      const message = 'Test info message';
      const metadata = { key: 'value' };
      logger.info(message, metadata);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(message),
        metadata
      );
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const message = 'Test error message';
      logger.error(message);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should log error messages with metadata', () => {
      const message = 'Test error message';
      const metadata = { key: 'value' };
      logger.error(message, metadata);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(message),
        metadata
      );
    });

    it('should log error objects', () => {
      const error = new Error('Test error');
      logger.error(error);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(error.message)
      );
      expect(console.error).toHaveBeenCalledWith(error.stack);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      const message = 'Test warning message';
      logger.warn(message);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should log warning messages with metadata', () => {
      const message = 'Test warning message';
      const metadata = { key: 'value' };
      logger.warn(message, metadata);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(message),
        metadata
      );
    });
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';
      logger.debug(message);
      expect(console.log).toHaveBeenCalledWith(
        '\x1b[35m%s\x1b[0m',
        expect.stringContaining(message)
      );
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test debug message';
      logger.debug(message);
      expect(console.log).not.toHaveBeenCalled();
    });
  });
}); 