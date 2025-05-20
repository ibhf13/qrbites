const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')
const { v4: uuidv4 } = require('uuid')
const { dirs } = require('@services/fileUploadService')
const { generateQRCode, getQRCodeUrl, generateMenuQRCode } = require('@services/qrCodeService')

// Mock external modules
jest.mock('fs')
jest.mock('qrcode')
jest.mock('uuid')

describe('QR Code Service', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()

        // Mock uuid function
        uuidv4.mockReturnValue('mock-uuid')

        // Mock QRCode.toFile
        QRCode.toFile = jest.fn().mockResolvedValue(undefined)
    })

    describe('generateQRCode', () => {
        it('should generate a QR code with default options', async () => {
            const url = 'https://example.com/menu/123'

            const result = await generateQRCode(url)

            expect(result).toBe('mock-uuid.png')
            expect(QRCode.toFile).toHaveBeenCalledWith(
                path.join(dirs.qrcode, 'mock-uuid.png'),
                url,
                expect.objectContaining({
                    errorCorrectionLevel: 'H',
                    type: 'png',
                    margin: 1
                })
            )
        })

        it('should generate a QR code with custom options', async () => {
            const url = 'https://example.com/menu/123'
            const options = {
                errorCorrectionLevel: 'L',
                margin: 2,
                color: {
                    dark: '#FF0000',
                    light: '#FFFFFF'
                }
            }

            const result = await generateQRCode(url, options)

            expect(result).toBe('mock-uuid.png')
            expect(QRCode.toFile).toHaveBeenCalledWith(
                path.join(dirs.qrcode, 'mock-uuid.png'),
                url,
                expect.objectContaining({
                    errorCorrectionLevel: 'L',
                    type: 'png',
                    margin: 2,
                    color: {
                        dark: '#FF0000',
                        light: '#FFFFFF'
                    }
                })
            )
        })

        it('should throw an error if QR code generation fails', async () => {
            const url = 'https://example.com/menu/123'
            const error = new Error('QR code generation failed')

            QRCode.toFile.mockRejectedValue(error)

            await expect(generateQRCode(url)).rejects.toThrow('Failed to generate QR code')
        })
    })

    describe('getQRCodeUrl', () => {
        it('should return null if filename is not provided', () => {
            const result = getQRCodeUrl(null)
            expect(result).toBeNull()
        })

        it('should return a URL for a given filename', () => {
            process.env.BASE_URL = 'https://example.com'

            const result = getQRCodeUrl('test.png')

            expect(result).toBe('https://example.com/uploads/qrcodes/test.png')

            // Restore environment variable
            delete process.env.BASE_URL
        })

        it('should use default URL if BASE_URL is not set', () => {
            const result = getQRCodeUrl('test.png')

            expect(result).toBe('http://localhost:5000/uploads/qrcodes/test.png')
        })
    })

    describe('generateMenuQRCode', () => {
        it('should generate a QR code for a menu', async () => {
            const menuId = '123456789'
            const restaurantId = '987654321'

            // Mock the internal functions
            QRCode.toFile.mockResolvedValue(undefined)

            const result = await generateMenuQRCode(menuId, restaurantId)

            expect(result).toBe('http://localhost:5000/uploads/qrcodes/mock-uuid.png')
            expect(QRCode.toFile).toHaveBeenCalledWith(
                path.join(dirs.qrcode, 'mock-uuid.png'),
                'http://localhost:5000/r/123456789?restaurant=987654321',
                expect.any(Object)
            )
        })

        it('should use FRONTEND_URL from environment if available', async () => {
            const menuId = '123456789'
            const restaurantId = '987654321'

            // Set environment variable
            const originalApiUrl = process.env.API_URL
            process.env.API_URL = 'https://api.qrbites.com'

            await generateMenuQRCode(menuId, restaurantId)

            expect(QRCode.toFile).toHaveBeenCalledWith(
                path.join(dirs.qrcode, 'mock-uuid.png'),
                'https://api.qrbites.com/r/123456789?restaurant=987654321',
                expect.any(Object)
            )

            // Restore environment variable
            process.env.API_URL = originalApiUrl
        })

        it('should throw an error if QR code generation fails', async () => {
            const menuId = '123456789'
            const restaurantId = '987654321'

            QRCode.toFile.mockRejectedValue(new Error('QR code generation failed'))

            await expect(generateMenuQRCode(menuId, restaurantId)).rejects.toThrow('Failed to generate menu QR code')
        })
    })
}) 