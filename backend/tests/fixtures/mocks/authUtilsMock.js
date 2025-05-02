/**
 * Mock authentication utilities for testing
 */

const generateToken = jest.fn(() => 'mock-jwt-token')
const verifyToken = jest.fn(() => ({ id: 'mock-user-id', role: 'user' }))
const hashPassword = jest.fn((password) => `hashed_${password}`)
const comparePassword = jest.fn((password, hash) => password === hash.replace('hashed_', ''))

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword
} 