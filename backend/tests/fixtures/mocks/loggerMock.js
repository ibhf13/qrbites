/**
 * Mock logger for testing
 */
const loggerMock = {
    info: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
}

module.exports = loggerMock 