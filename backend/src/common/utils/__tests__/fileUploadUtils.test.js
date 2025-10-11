const {
  attachFileUrl,
  attachFileUrls,
  updateDocumentWithFileUrl,
  validateFileUpload,
} = require('../fileUploadUtils')

// Mock dependencies
jest.mock('@commonServices/upload/fileUploadService', () => ({
  getFileUrl: jest.fn(),
}))

jest.mock('@commonUtils/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
}))

jest.mock('@errors', () => ({
  badRequest: jest.fn(message => {
    const error = new Error(message)
    error.name = 'BadRequestError'
    error.statusCode = 400
    throw error
  }),
  errorMessages: {
    common: {
      invalidIdFormat: type => `Invalid ${type} ID format`,
    },
  },
  logDatabaseError: jest.fn(),
}))

const { getFileUrl } = require('@commonServices/upload/fileUploadService')
const logger = require('@commonUtils/logger')
const { badRequest, logDatabaseError } = require('@errors')

describe('File Upload Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('attachFileUrl', () => {
    it('should return false when no file is uploaded', () => {
      const req = { body: {} }
      const result = attachFileUrl(req, 'menu', 'imageUrl')

      expect(result).toBe(false)
      expect(req.body.imageUrl).toBeUndefined()
    })

    it('should attach file URL when file is uploaded without relativePath', () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
        },
        body: {},
      }

      getFileUrl.mockReturnValue('/uploads/menus/test-image.jpg')

      const result = attachFileUrl(req, 'menu', 'imageUrl')

      expect(result).toBe(true)
      expect(req.body.imageUrl).toBe('/uploads/menus/test-image.jpg')
      expect(getFileUrl).toHaveBeenCalledWith('test-image.jpg', 'menu')
      expect(logger.debug).toHaveBeenCalledWith(
        'Attached file URL to imageUrl: /uploads/menus/test-image.jpg'
      )
    })

    it('should attach file URL when file is uploaded with relativePath', () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
          relativePath: '2025/01/15',
        },
        body: {},
      }

      getFileUrl.mockReturnValue('/uploads/menus/2025/01/15/test-image.jpg')

      const result = attachFileUrl(req, 'menu', 'imageUrl')

      expect(result).toBe(true)
      expect(req.body.imageUrl).toBe('/uploads/menus/2025/01/15/test-image.jpg')
      expect(getFileUrl).toHaveBeenCalledWith('test-image.jpg', 'menu', '2025/01/15')
      expect(logger.debug).toHaveBeenCalledWith(
        'Attached file URL to imageUrl: /uploads/menus/2025/01/15/test-image.jpg'
      )
    })

    it('should handle errors and return false', () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
        },
        body: {},
      }

      const error = new Error('File URL generation failed')
      getFileUrl.mockImplementation(() => {
        throw error
      })

      const result = attachFileUrl(req, 'menu', 'imageUrl')

      expect(result).toBe(false)
      expect(req.body.imageUrl).toBeUndefined()
      expect(logger.error).toHaveBeenCalledWith('Error attaching file URL to imageUrl:', error)
    })
  })

  describe('attachFileUrls', () => {
    it('should return false when no files are uploaded', () => {
      const req = { body: {} }
      const result = attachFileUrls(req, 'menu', 'imageUrls')

      expect(result).toBe(false)
      expect(req.body.imageUrls).toBeUndefined()
    })

    it('should return false when files array is empty', () => {
      const req = { files: [], body: {} }
      const result = attachFileUrls(req, 'menu', 'imageUrls')

      expect(result).toBe(false)
      expect(req.body.imageUrls).toBeUndefined()
    })

    it('should attach multiple file URLs without relativePath', () => {
      const req = {
        files: [{ filename: 'image1.jpg' }, { filename: 'image2.jpg' }],
        body: {},
      }

      getFileUrl
        .mockReturnValueOnce('/uploads/menus/image1.jpg')
        .mockReturnValueOnce('/uploads/menus/image2.jpg')

      const result = attachFileUrls(req, 'menu', 'imageUrls')

      expect(result).toBe(true)
      expect(req.body.imageUrls).toEqual(['/uploads/menus/image1.jpg', '/uploads/menus/image2.jpg'])
      expect(logger.debug).toHaveBeenCalledWith('Attached 2 file URLs to imageUrls')
    })

    it('should attach multiple file URLs with relativePath', () => {
      const req = {
        files: [
          { filename: 'image1.jpg', relativePath: '2025/01/15' },
          { filename: 'image2.jpg', relativePath: '2025/01/15' },
        ],
        body: {},
      }

      getFileUrl
        .mockReturnValueOnce('/uploads/menus/2025/01/15/image1.jpg')
        .mockReturnValueOnce('/uploads/menus/2025/01/15/image2.jpg')

      const result = attachFileUrls(req, 'menu', 'imageUrls')

      expect(result).toBe(true)
      expect(req.body.imageUrls).toEqual([
        '/uploads/menus/2025/01/15/image1.jpg',
        '/uploads/menus/2025/01/15/image2.jpg',
      ])
    })

    it('should set single field for backward compatibility', () => {
      const req = {
        files: [{ filename: 'image1.jpg' }, { filename: 'image2.jpg' }],
        body: {},
      }

      getFileUrl
        .mockReturnValueOnce('/uploads/menus/image1.jpg')
        .mockReturnValueOnce('/uploads/menus/image2.jpg')

      const result = attachFileUrls(req, 'menu', 'imageUrls', 'imageUrl')

      expect(result).toBe(true)
      expect(req.body.imageUrls).toEqual(['/uploads/menus/image1.jpg', '/uploads/menus/image2.jpg'])
      expect(req.body.imageUrl).toBe('/uploads/menus/image1.jpg')
    })

    it('should handle errors and return false', () => {
      const req = {
        files: [{ filename: 'image1.jpg' }],
        body: {},
      }

      const error = new Error('File URL generation failed')
      getFileUrl.mockImplementation(() => {
        throw error
      })

      const result = attachFileUrls(req, 'menu', 'imageUrls')

      expect(result).toBe(false)
      expect(req.body.imageUrls).toBeUndefined()
      expect(logger.error).toHaveBeenCalledWith('Error attaching file URLs to imageUrls:', error)
    })
  })

  describe('updateDocumentWithFileUrl', () => {
    let mockModel

    beforeEach(() => {
      mockModel = {
        modelName: 'TestModel',
        findByIdAndUpdate: jest.fn(),
      }
    })

    it('should throw error when no file is uploaded', async () => {
      const req = { body: {} }

      // Test that badRequest is called
      await updateDocumentWithFileUrl(mockModel, 'documentId', req, 'menu', 'imageUrl').catch(
        () => {}
      )
      expect(badRequest).toHaveBeenCalledWith('No file uploaded')
    })

    it('should update document with file URL without relativePath', async () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
        },
      }

      const updatedDocument = { _id: 'documentId', imageUrl: '/uploads/menus/test-image.jpg' }

      getFileUrl.mockReturnValue('/uploads/menus/test-image.jpg')
      mockModel.findByIdAndUpdate.mockResolvedValue(updatedDocument)

      const result = await updateDocumentWithFileUrl(
        mockModel,
        'documentId',
        req,
        'menu',
        'imageUrl'
      )

      expect(result).toEqual(updatedDocument)
      expect(getFileUrl).toHaveBeenCalledWith('test-image.jpg', 'menu')
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'documentId',
        { imageUrl: '/uploads/menus/test-image.jpg' },
        { new: true, runValidators: true }
      )
      expect(logger.debug).toHaveBeenCalledWith(
        'Updated document documentId with imageUrl: /uploads/menus/test-image.jpg'
      )
    })

    it('should update document with file URL with relativePath', async () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
          relativePath: '2025/01/15',
        },
      }

      const updatedDocument = {
        _id: 'documentId',
        imageUrl: '/uploads/menus/2025/01/15/test-image.jpg',
      }

      getFileUrl.mockReturnValue('/uploads/menus/2025/01/15/test-image.jpg')
      mockModel.findByIdAndUpdate.mockResolvedValue(updatedDocument)

      const result = await updateDocumentWithFileUrl(
        mockModel,
        'documentId',
        req,
        'menu',
        'imageUrl'
      )

      expect(result).toEqual(updatedDocument)
      expect(getFileUrl).toHaveBeenCalledWith('test-image.jpg', 'menu', '2025/01/15')
    })

    it('should handle CastError and throw badRequest', async () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
        },
      }

      const castError = new Error('Cast to ObjectId failed')
      castError.name = 'CastError'

      getFileUrl.mockReturnValue('/uploads/menus/test-image.jpg')
      mockModel.findByIdAndUpdate.mockRejectedValue(castError)

      // Test that badRequest is called
      await updateDocumentWithFileUrl(mockModel, 'invalidId', req, 'menu', 'imageUrl').catch(
        () => {}
      )
      expect(badRequest).toHaveBeenCalledWith('Invalid Document ID format')
    })

    it('should handle database errors and log them', async () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
        },
      }

      const dbError = new Error('Database connection failed')

      getFileUrl.mockReturnValue('/uploads/menus/test-image.jpg')
      mockModel.findByIdAndUpdate.mockRejectedValue(dbError)

      await expect(
        updateDocumentWithFileUrl(mockModel, 'documentId', req, 'menu', 'imageUrl')
      ).rejects.toThrow('Database connection failed')

      expect(logDatabaseError).toHaveBeenCalledWith(dbError, 'UPDATE', {
        collection: 'TestModel',
        id: 'documentId',
        field: 'imageUrl',
      })
    })
  })

  describe('validateFileUpload', () => {
    it('should not throw when file is uploaded', () => {
      const req = {
        file: {
          filename: 'test-image.jpg',
        },
      }

      expect(() => validateFileUpload(req)).not.toThrow()
    })

    it('should throw error with default message when no file is uploaded', () => {
      const req = { body: {} }

      // Test that badRequest is called
      try {
        validateFileUpload(req)
      } catch (e) {
        // Expected to throw
      }
      expect(badRequest).toHaveBeenCalledWith('File upload is required')
    })

    it('should throw error with custom message when no file is uploaded', () => {
      const req = { body: {} }
      const customMessage = 'Please upload an image file'

      // Test that badRequest is called
      try {
        validateFileUpload(req, customMessage)
      } catch (e) {
        // Expected to throw
      }
      expect(badRequest).toHaveBeenCalledWith(customMessage)
    })
  })
})
