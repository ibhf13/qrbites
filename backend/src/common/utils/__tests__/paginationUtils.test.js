const {
  parsePaginationParams,
  buildSortObject,
  buildPaginationResponse,
  paginate,
  buildQueryFilters,
  createPaginatedController,
  DEFAULT_PAGINATION,
} = require('../paginationUtils')

// Mock logger to avoid console output during tests
jest.mock('@commonUtils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}))

// Mock sanitization utilities
jest.mock('@commonUtils/sanitization', () => ({
  createSafeRegexQuery: jest.fn(input => {
    if (!input) return null
    return { $regex: input, $options: 'i' }
  }),
  createSafeSearchQuery: jest.fn((search, fields) => {
    if (!search || !fields || fields.length === 0) return []
    return fields.map(field => ({ [field]: { $regex: search, $options: 'i' } }))
  }),
}))

// Mock errors
jest.mock('@errors', () => ({
  badRequest: jest.fn(message => {
    const error = new Error(message)
    error.name = 'BadRequestError'
    throw error
  }),
  errorMessages: {
    common: {
      invalidIdFormat: type => `Invalid ${type} ID format`,
    },
  },
  logDatabaseError: jest.fn(),
}))

describe('Pagination Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('parsePaginationParams', () => {
    it('should parse default pagination parameters', () => {
      const result = parsePaginationParams({})

      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      })
    })

    it('should parse custom pagination parameters', () => {
      const result = parsePaginationParams({ page: '3', limit: '25' })

      expect(result).toEqual({
        page: 3,
        limit: 25,
        skip: 50,
      })
    })

    it('should handle invalid page numbers', () => {
      const result = parsePaginationParams({ page: '-1', limit: '0' })

      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      })
    })

    it('should respect max limit', () => {
      const result = parsePaginationParams({ limit: '200' }, { maxLimit: 50 })

      expect(result).toEqual({
        page: 1,
        limit: 50,
        skip: 0,
      })
    })

    it('should use custom defaults', () => {
      const result = parsePaginationParams({}, { defaultPage: 2, defaultLimit: 20 })

      expect(result).toEqual({
        page: 2,
        limit: 20,
        skip: 20,
      })
    })
  })

  describe('buildSortObject', () => {
    it('should build default sort object', () => {
      const result = buildSortObject({})

      expect(result).toEqual({ createdAt: -1 })
    })

    it('should build custom sort object', () => {
      const result = buildSortObject({ sortBy: 'name', order: 'asc' })

      expect(result).toEqual({ name: 1 })
    })

    it('should validate allowed sort fields', () => {
      const result = buildSortObject(
        { sortBy: 'invalidField', order: 'desc' },
        'createdAt',
        'desc',
        ['name', 'createdAt']
      )

      expect(result).toEqual({ createdAt: -1 })
    })

    it('should handle case insensitive order', () => {
      const result = buildSortObject({ sortBy: 'name', order: 'DESC' })

      expect(result).toEqual({ name: -1 })
    })
  })

  describe('buildPaginationResponse', () => {
    it('should build pagination response', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const result = buildPaginationResponse(data, 2, 10, 25)

      expect(result).toEqual({
        success: true,
        data,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          pages: 3,
          hasNextPage: true,
          hasPrevPage: true,
        },
      })
    })

    it('should handle first page', () => {
      const data = [{ id: 1 }]
      const result = buildPaginationResponse(data, 1, 10, 5)

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        pages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      })
    })
  })

  describe('buildQueryFilters', () => {
    it('should build exact match filters', () => {
      const result = buildQueryFilters(
        { role: 'admin', status: 'active' },
        { exactMatch: ['role', 'status'] }
      )

      expect(result).toEqual({
        role: 'admin',
        status: 'active',
      })
    })

    it('should build regex match filters', () => {
      const { createSafeRegexQuery } = require('@commonUtils/sanitization')
      createSafeRegexQuery.mockReturnValue({ $regex: 'test', $options: 'i' })

      const result = buildQueryFilters({ name: 'test' }, { regexMatch: ['name'] })

      expect(result).toEqual({
        name: { $regex: 'test', $options: 'i' },
      })
    })

    it('should build search filters', () => {
      const { createSafeSearchQuery } = require('@commonUtils/sanitization')
      createSafeSearchQuery.mockReturnValue([
        { name: { $regex: 'search', $options: 'i' } },
        { description: { $regex: 'search', $options: 'i' } },
      ])

      const result = buildQueryFilters(
        { search: 'search' },
        { searchFields: ['name', 'description'] }
      )

      expect(result).toEqual({
        $or: [
          { name: { $regex: 'search', $options: 'i' } },
          { description: { $regex: 'search', $options: 'i' } },
        ],
      })
    })

    it('should build custom filters', () => {
      const result = buildQueryFilters(
        { isActive: 'true', count: '5' },
        {
          customFilters: {
            isActive: value => (value === 'true' ? true : false),
            count: value => parseInt(value),
          },
        }
      )

      expect(result).toEqual({
        isActive: true,
        count: 5,
      })
    })

    it('should handle multiple filter types', () => {
      const { createSafeRegexQuery, createSafeSearchQuery } = require('@commonUtils/sanitization')
      createSafeRegexQuery.mockReturnValue({ $regex: 'test', $options: 'i' })
      createSafeSearchQuery.mockReturnValue([{ name: { $regex: 'search', $options: 'i' } }])

      const result = buildQueryFilters(
        { role: 'admin', name: 'test', search: 'search', isActive: 'true' },
        {
          exactMatch: ['role'],
          regexMatch: ['name'],
          searchFields: ['name'],
          customFilters: {
            isActive: value => (value === 'true' ? true : false),
          },
        }
      )

      expect(result).toEqual({
        role: 'admin',
        name: { $regex: 'test', $options: 'i' },
        $or: [{ name: { $regex: 'search', $options: 'i' } }],
        isActive: true,
      })
    })
  })

  describe('paginate', () => {
    let mockModel

    beforeEach(() => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // This should return a promise
      }

      mockModel = {
        modelName: 'TestModel',
        find: jest.fn().mockReturnValue(mockQuery),
        countDocuments: jest.fn(),
      }
    })

    it('should execute paginated query', async () => {
      const mockData = [{ id: 1 }, { id: 2 }]
      const mockCount = 25
      const mockQuery = mockModel.find()

      // Override the limit mock for this test
      mockQuery.limit.mockResolvedValue(mockData)
      mockModel.countDocuments.mockResolvedValue(mockCount)

      const result = await paginate(
        mockModel,
        { status: 'active' },
        {
          pagination: { page: 2, limit: 10 },
          sort: { defaultSortBy: 'createdAt', defaultOrder: 'desc' },
        }
      )

      expect(result).toEqual({
        success: true,
        data: mockData,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          pages: 3,
          hasNextPage: true,
          hasPrevPage: true,
        },
      })

      expect(mockModel.find).toHaveBeenCalledWith({ status: 'active' })
      expect(mockQuery.select).not.toHaveBeenCalled()
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(mockQuery.skip).toHaveBeenCalledWith(10)
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(mockModel.countDocuments).toHaveBeenCalledWith({ status: 'active' })
    })

    it('should handle population and selection', async () => {
      const mockData = [{ id: 1 }]
      const mockCount = 1
      const mockQuery = mockModel.find()

      mockQuery.limit.mockResolvedValue(mockData)
      mockModel.countDocuments.mockResolvedValue(mockCount)

      await paginate(
        mockModel,
        {},
        {
          populate: [{ path: 'user', select: 'name' }, { path: 'category' }],
          select: '-__v',
          lean: true,
        }
      )

      expect(mockQuery.select).toHaveBeenCalledWith('-__v')
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'user', select: 'name' })
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'category' })
      expect(mockQuery.lean).toHaveBeenCalled()
    })

    it('should handle custom sort configuration', async () => {
      const mockData = []
      const mockCount = 0
      const mockQuery = mockModel.find()

      mockQuery.limit.mockResolvedValue(mockData)
      mockModel.countDocuments.mockResolvedValue(mockCount)

      await paginate(
        mockModel,
        {},
        {
          sort: {
            sortBy: 'name',
            order: 'asc',
            allowedSortFields: ['name', 'createdAt'],
          },
        }
      )

      expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 })
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error')
      const mockQuery = mockModel.find()

      // Make the query chain throw an error
      mockQuery.limit.mockRejectedValue(error)

      await expect(paginate(mockModel, {})).rejects.toThrow('Database error')
    })
  })

  describe('createPaginatedController', () => {
    let mockModel, mockReq, mockRes

    beforeEach(() => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      mockModel = {
        modelName: 'TestModel',
        find: jest.fn().mockReturnValue(mockQuery),
        countDocuments: jest.fn(),
      }

      mockReq = {
        query: { page: '1', limit: '10', name: 'test' },
        user: { _id: 'user123' },
      }

      mockRes = {
        json: jest.fn(),
      }
    })

    it('should create a working controller', async () => {
      const mockData = [{ id: 1 }]
      const mockCount = 1
      const mockQuery = mockModel.find()

      mockQuery.limit.mockResolvedValue(mockData)
      mockModel.countDocuments.mockResolvedValue(mockCount)

      const controller = createPaginatedController(mockModel, {
        filterConfig: {
          regexMatch: ['name'],
        },
      })

      await controller(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    })

    it('should handle beforeQuery hook', async () => {
      const mockData = []
      const mockCount = 0
      const mockQuery = mockModel.find()

      mockQuery.limit.mockResolvedValue(mockData)
      mockModel.countDocuments.mockResolvedValue(mockCount)

      const beforeQuery = jest.fn((query, req) => {
        return { ...query, userId: req.user._id }
      })

      const controller = createPaginatedController(mockModel, {
        beforeQuery,
      })

      await controller(mockReq, mockRes)

      expect(beforeQuery).toHaveBeenCalledWith({}, mockReq)
      expect(mockModel.find).toHaveBeenCalledWith({ userId: 'user123' })
    })

    it('should handle afterQuery hook', async () => {
      const mockData = [{ id: 1 }]
      const mockCount = 1
      const mockQuery = mockModel.find()

      mockQuery.limit.mockResolvedValue(mockData)
      mockModel.countDocuments.mockResolvedValue(mockCount)

      const afterQuery = jest.fn((data, req) => {
        return data.map(item => ({ ...item, processed: true }))
      })

      const controller = createPaginatedController(mockModel, {
        afterQuery,
      })

      await controller(mockReq, mockRes)

      expect(afterQuery).toHaveBeenCalledWith(mockData, mockReq)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1, processed: true }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    })

    it('should handle errors in controller', async () => {
      const error = new Error('Controller error')
      const mockQuery = mockModel.find()

      // Make the query chain throw an error
      mockQuery.limit.mockRejectedValue(error)

      const controller = createPaginatedController(mockModel)

      await expect(controller(mockReq, mockRes)).rejects.toThrow('Controller error')
    })
  })

  describe('DEFAULT_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_PAGINATION).toEqual({
        page: 1,
        limit: 10,
        maxLimit: 100,
      })
    })
  })
})
