const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { upload, getFileUrl, multerErrorHandler, dirs } = require('@services/fileUploadService')

// Mock dependencies
jest.mock('fs')
jest.mock('uuid')
jest.mock('multer')
jest.mock('@utils/logger')

describe('File Upload Service', () => {
    let req, res, next

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Mock UUID
        uuidv4.mockReturnValue('mock-uuid')

        // Setup request, response, next
        req = {
            originalUrl: '',
            file: { filename: 'test-file.jpg' }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        next = jest.fn()

        // Mock filesystem functions
        fs.existsSync = jest.fn().mockReturnValue(true)
        fs.mkdirSync = jest.fn()
    })

    describe('Directory setup', () => {
        it('should create directory if it does not exist', () => {
            // Simulate directory not existing
            fs.existsSync.mockReturnValueOnce(false)

            // Re-import to trigger directory creation
            jest.isolateModules(() => {
                require('@services/fileUploadService')
            })

            // Verify directory creation was attempted
            expect(fs.mkdirSync).toHaveBeenCalled()
        })

        it('should not create directory if it already exists', () => {
            // Simulate directory existing
            fs.existsSync.mockReturnValue(true)

            // Re-import to check directory creation
            jest.isolateModules(() => {
                require('@services/fileUploadService')
            })

            // Verify directory creation was not attempted
            expect(fs.mkdirSync).not.toHaveBeenCalled()
        })

        it('should create all required subdirectories', () => {
            // Force directories to not exist
            fs.existsSync.mockReturnValue(false)

            // Re-import to trigger directory creation
            jest.isolateModules(() => {
                require('@services/fileUploadService')
            })

            // Verify all directories were created
            expect(fs.mkdirSync).toHaveBeenCalledTimes(6) // Base upload dir + 5 subdirs
        })
    })

    describe('getFileUrl', () => {
        it('should return null if filename is not provided', () => {
            const result = getFileUrl(null, 'menu')
            expect(result).toBeNull()
        })

        it('should generate correct URL for a file', () => {
            const result = getFileUrl('test-file.jpg', 'menu')
            expect(result).toBe('http://localhost:5000/uploads/menus/test-file.jpg')
        })

        it('should use BASE_URL from environment if available', () => {
            // Set environment variable
            const originalBaseUrl = process.env.BASE_URL
            process.env.BASE_URL = 'https://api.qrbites.com'

            const result = getFileUrl('test-file.jpg', 'menu')
            expect(result).toBe('https://api.qrbites.com/uploads/menus/test-file.jpg')

            // Restore environment variable
            process.env.BASE_URL = originalBaseUrl
        })

        it('should generate correct URL for profile files', () => {
            const result = getFileUrl('profile-picture.jpg', 'profile')
            expect(result).toBe('http://localhost:5000/uploads/profiles/profile-picture.jpg')
        })
    })

    describe('multerErrorHandler', () => {
        it('should handle file size exceeded error', () => {
            const sizeError = new multer.MulterError('LIMIT_FILE_SIZE')
            sizeError.code = 'LIMIT_FILE_SIZE'
            multerErrorHandler(sizeError, req, res, next)

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('File size too large')
            }))
        })

        it('should handle general multer errors', () => {
            const generalError = new multer.MulterError('GENERAL_ERROR')
            generalError.message = 'Test error message'

            multerErrorHandler(generalError, req, res, next)

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Test error message')
            }))
        })

        it('should handle non-multer errors', () => {
            const nonMulterError = new Error('Invalid file type')

            multerErrorHandler(nonMulterError, req, res, next)

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid file type'
            }))
        })

        it('should call next with no arguments if no error', () => {
            multerErrorHandler(null, req, res, next)
            expect(next).toHaveBeenCalledWith()
        })
    })

    describe('multer configuration', () => {
        let storageConfig, fileFilterFn

        beforeEach(() => {
            // Mock multer to capture config
            const mockDiskStorage = jest.fn().mockReturnValue('mockedStorage')
            multer.diskStorage = mockDiskStorage

            multer.mockImplementation((config) => {
                storageConfig = mockDiskStorage.mock.calls[0][0]
                fileFilterFn = config.fileFilter
                return 'mockedUploader'
            })

            // Re-import to capture configuration
            jest.isolateModules(() => {
                require('@services/fileUploadService')
            })
        })

        describe('storage configuration', () => {
            it('should set restaurant destination based on URL', () => {
                const req = { originalUrl: '/api/restaurants/123' }
                const file = {}
                const cb = jest.fn()

                storageConfig.destination(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('restaurants'))
            })

            it('should set menu destination based on URL', () => {
                const req = { originalUrl: '/api/menus/123' }
                const file = {}
                const cb = jest.fn()

                storageConfig.destination(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('menus'))
            })

            it('should set menu-item destination based on URL', () => {
                const req = { originalUrl: '/api/menu-items/123' }
                const file = {}
                const cb = jest.fn()

                storageConfig.destination(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('menu-items'))
            })

            it('should set profile destination based on URL', () => {
                const req = { originalUrl: '/api/profile/picture' }
                const file = {}
                const cb = jest.fn()

                storageConfig.destination(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('profiles'))
            })

            it('should generate unique filename', () => {
                const req = {}
                const file = { originalname: 'original.jpg' }
                const cb = jest.fn()

                storageConfig.filename(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, 'mock-uuid.jpg')
            })

            it('should preserve test filename in test environment', () => {
                const originalEnv = process.env.NODE_ENV
                process.env.NODE_ENV = 'test'

                const req = {}
                const file = { originalname: 'test-menu.jpg' }
                const cb = jest.fn()

                storageConfig.filename(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, 'test-menu.jpg')

                // Restore environment
                process.env.NODE_ENV = originalEnv
            })
        })

        describe('file filter', () => {
            it('should accept JPEG images', () => {
                const req = {}
                const file = {
                    mimetype: 'image/jpeg',
                    originalname: 'test.jpg'
                }
                const cb = jest.fn()

                fileFilterFn(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, true)
            })

            it('should accept PNG images', () => {
                const req = {}
                const file = {
                    mimetype: 'image/png',
                    originalname: 'test.png'
                }
                const cb = jest.fn()

                fileFilterFn(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, true)
            })

            it('should reject non-image files', () => {
                const req = {}
                const file = {
                    mimetype: 'application/pdf',
                    originalname: 'test.pdf'
                }
                const cb = jest.fn()

                fileFilterFn(req, file, cb)

                expect(cb).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.stringContaining('Only image files are allowed')
                    }),
                    false
                )
            })

            it('should accept test file in test environment', () => {
                const originalEnv = process.env.NODE_ENV
                process.env.NODE_ENV = 'test'

                const req = {}
                const file = { originalname: 'test-menu.jpg' }
                const cb = jest.fn()

                fileFilterFn(req, file, cb)

                expect(cb).toHaveBeenCalledWith(null, true)

                // Restore environment
                process.env.NODE_ENV = originalEnv
            })
        })
    })
}) 