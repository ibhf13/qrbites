const logger = require('../logger')

// Mock console to avoid output during tests
const originalConsole = global.console
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.console = originalConsole
  })

  describe('Logger Methods', () => {
    it('should have all required logging methods', () => {
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.success).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.http).toBe('function')
    })

    it('should call info method without throwing', () => {
      expect(() => {
        logger.info('Test info message')
      }).not.toThrow()
    })

    it('should call info method with data without throwing', () => {
      expect(() => {
        logger.info('Test info message', { userId: '123' })
      }).not.toThrow()
    })

    it('should call success method without throwing', () => {
      expect(() => {
        logger.success('Test success message')
      }).not.toThrow()
    })

    it('should call success method with data without throwing', () => {
      expect(() => {
        logger.success('Test success message', { recordId: '456' })
      }).not.toThrow()
    })

    it('should call warn method without throwing', () => {
      expect(() => {
        logger.warn('Test warning message')
      }).not.toThrow()
    })

    it('should call warn method with data without throwing', () => {
      expect(() => {
        logger.warn('Test warning message', { deprecated: 'oldMethod' })
      }).not.toThrow()
    })

    it('should call error method without throwing', () => {
      expect(() => {
        logger.error('Test error message')
      }).not.toThrow()
    })

    it('should call error method with Error object without throwing', () => {
      const error = new Error('Test error')
      expect(() => {
        logger.error('Test error message', error)
      }).not.toThrow()
    })

    it('should call error method with plain object without throwing', () => {
      const errorData = { code: 'DB_ERROR', details: 'Connection timeout' }
      expect(() => {
        logger.error('Test error message', errorData)
      }).not.toThrow()
    })

    it('should call debug method without throwing', () => {
      expect(() => {
        logger.debug('Test debug message')
      }).not.toThrow()
    })

    it('should call debug method with data without throwing', () => {
      expect(() => {
        logger.debug('Test debug message', { query: 'SELECT * FROM users' })
      }).not.toThrow()
    })

    it('should call http method without throwing', () => {
      const mockReq = {
        method: 'GET',
        url: '/api/users',
      }

      expect(() => {
        logger.http(mockReq, 200)
      }).not.toThrow()
    })

    it('should call http method with different status codes without throwing', () => {
      const mockReq = {
        method: 'POST',
        url: '/api/users',
      }

      expect(() => {
        logger.http(mockReq, 201)
        logger.http(mockReq, 400)
        logger.http(mockReq, 500)
      }).not.toThrow()
    })

    it('should handle string status codes in http method', () => {
      const mockReq = {
        method: 'GET',
        url: '/api/test',
      }

      expect(() => {
        logger.http(mockReq, '201')
      }).not.toThrow()
    })

    it('should handle invalid status codes in http method', () => {
      const mockReq = {
        method: 'GET',
        url: '/api/test',
      }

      expect(() => {
        logger.http(mockReq, 'invalid')
      }).not.toThrow()
    })
  })

  describe('Logger Configuration', () => {
    it('should be configured for the correct environment', () => {
      // In test environment, debug level should be available
      expect(() => {
        logger.debug('Debug message in test environment')
      }).not.toThrow()
    })

    it('should handle different log levels appropriately', () => {
      const testMessage = 'Test message'

      expect(() => {
        logger.error(testMessage)
        logger.warn(testMessage)
        logger.info(testMessage)
        logger.success(testMessage)
        logger.debug(testMessage)
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle null error gracefully', () => {
      expect(() => {
        logger.error('Test error message', null)
      }).not.toThrow()
    })

    it('should handle undefined error gracefully', () => {
      expect(() => {
        logger.error('Test error message', undefined)
      }).not.toThrow()
    })

    it('should handle empty string messages', () => {
      expect(() => {
        logger.info('')
        logger.warn('')
        logger.error('')
      }).not.toThrow()
    })

    it('should handle complex data objects', () => {
      const complexData = {
        user: {
          id: '123',
          profile: {
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        metadata: {
          timestamp: new Date(),
          version: '1.0.0',
        },
      }

      expect(() => {
        logger.info('Complex data test', complexData)
      }).not.toThrow()
    })
  })
})
