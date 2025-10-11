const { badRequest, errorMessages, logDatabaseError } = require('@errors')

const logger = require('./logger')

/**
 * Default pagination configuration
 */
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  maxLimit: 100,
}

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {Object} options - Configuration options
 * @param {number} options.defaultPage - Default page number
 * @param {number} options.defaultLimit - Default limit per page
 * @param {number} options.maxLimit - Maximum allowed limit
 * @returns {Object} Parsed pagination parameters
 */
const parsePaginationParams = (query, options = {}) => {
  const config = { ...DEFAULT_PAGINATION, ...options }

  const page = Math.max(1, parseInt(query.page) || config.defaultPage || config.page)
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || config.defaultLimit || config.limit),
    config.maxLimit
  )

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

/**
 * Build sort object from query parameters
 * @param {Object} query - Request query object
 * @param {string} defaultSortBy - Default field to sort by
 * @param {string} defaultOrder - Default sort order ('asc' or 'desc')
 * @param {Array} allowedSortFields - Array of allowed sort fields
 * @returns {Object} Sort object for Mongoose
 */
const buildSortObject = (
  query,
  defaultSortBy = 'createdAt',
  defaultOrder = 'desc',
  allowedSortFields = []
) => {
  const sortBy = query.sortBy || defaultSortBy
  const order = query.order || defaultOrder

  // Validate sort field if allowed fields are specified
  if (allowedSortFields.length > 0 && !allowedSortFields.includes(sortBy)) {
    logger.warn(`Invalid sort field: ${sortBy}. Using default: ${defaultSortBy}`)
    return { [defaultSortBy]: defaultOrder.toLowerCase() === 'desc' ? -1 : 1 }
  }

  return {
    [sortBy]: order.toLowerCase() === 'desc' ? -1 : 1,
  }
}

/**
 * Build pagination response object
 * @param {Array} data - Array of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of documents
 * @returns {Object} Formatted pagination response
 */
const buildPaginationResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  }
}

/**
 * Generic pagination function for Mongoose models
 * @param {Object} Model - Mongoose model
 * @param {Object} baseQuery - Base query object
 * @param {Object} options - Pagination and query options
 * @param {Object} options.pagination - Pagination configuration
 * @param {Object} options.sort - Sort configuration
 * @param {Array} options.populate - Population options
 * @param {string} options.select - Field selection string
 * @param {boolean} options.lean - Whether to return lean documents
 * @returns {Promise<Object>} Paginated result with data and pagination info
 */
const paginate = async (Model, baseQuery = {}, options = {}) => {
  const { pagination = {}, sort = {}, populate = [], select = '', lean = false } = options

  // Parse pagination parameters
  const { page, limit, skip } = parsePaginationParams(pagination, {
    defaultPage: pagination.page || DEFAULT_PAGINATION.page,
    defaultLimit: pagination.limit || DEFAULT_PAGINATION.limit,
    maxLimit: pagination.maxLimit || DEFAULT_PAGINATION.maxLimit,
  })

  // Build sort object
  const sortObj = buildSortObject(
    sort,
    sort.defaultSortBy,
    sort.defaultOrder,
    sort.allowedSortFields
  )

  try {
    // Build query
    let query = Model.find(baseQuery)

    // Apply field selection
    if (select) {
      query = query.select(select)
    }

    // Apply sorting
    query = query.sort(sortObj)

    // Apply population
    if (populate.length > 0) {
      populate.forEach(populateOption => {
        query = query.populate(populateOption)
      })
    }

    // Apply lean if specified
    if (lean) {
      query = query.lean()
    }

    // Execute query with pagination
    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Model.countDocuments(baseQuery),
    ])

    // Build response
    return buildPaginationResponse(data, page, limit, total)
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Query parameter'))
    }
    logDatabaseError(error, 'FIND', {
      collection: Model.modelName,
      query: baseQuery,
      operation: 'pagination',
      options,
    })
    throw error
  }
}

/**
 * Build query filters from request parameters
 * @param {Object} query - Request query object
 * @param {Object} filterConfig - Filter configuration
 * @param {Array} filterConfig.exactMatch - Fields that require exact match
 * @param {Array} filterConfig.regexMatch - Fields that support regex search
 * @param {Array} filterConfig.searchFields - Fields to search in for general search
 * @param {Object} filterConfig.customFilters - Custom filter functions
 * @returns {Object} Built query object
 */
const buildQueryFilters = (query, filterConfig = {}) => {
  const { exactMatch = [], regexMatch = [], searchFields = [], customFilters = {} } = filterConfig

  const filters = {}

  // Handle exact match filters
  exactMatch.forEach(field => {
    if (query[field] !== undefined) {
      filters[field] = query[field]
    }
  })

  // Handle regex match filters
  regexMatch.forEach(field => {
    if (query[field]) {
      const { createSafeRegexQuery } = require('./sanitization')
      const safeRegexQuery = createSafeRegexQuery(query[field])
      if (safeRegexQuery) {
        filters[field] = safeRegexQuery
      }
    }
  })

  // Handle general search across multiple fields
  if (query.search && searchFields.length > 0) {
    const { createSafeSearchQuery } = require('./sanitization')
    const safeSearchQueries = createSafeSearchQuery(query.search, searchFields)
    if (safeSearchQueries.length > 0) {
      filters.$or = safeSearchQueries
    }
  }

  // Handle custom filters
  Object.entries(customFilters).forEach(([field, filterFn]) => {
    if (query[field] !== undefined) {
      const result = filterFn(query[field])
      if (result !== null && result !== undefined) {
        filters[field] = result
      }
    }
  })

  return filters
}

/**
 * Create a paginated controller function
 * @param {Object} Model - Mongoose model
 * @param {Object} config - Configuration object
 * @returns {Function} Controller function
 */
const createPaginatedController = (Model, config = {}) => {
  const {
    filterConfig = {},
    sortConfig = {},
    paginationConfig = {},
    populate = [],
    select = '',
    lean = false,
    beforeQuery = null,
    afterQuery = null,
  } = config

  return async (req, res) => {
    try {
      // Build base query
      let baseQuery = buildQueryFilters(req.query, filterConfig)

      // Apply custom query modifications
      if (beforeQuery && typeof beforeQuery === 'function') {
        baseQuery = await beforeQuery(baseQuery, req)
      }

      // Execute pagination
      const result = await paginate(Model, baseQuery, {
        pagination: {
          page: req.query.page,
          limit: req.query.limit,
          ...paginationConfig,
        },
        sort: {
          sortBy: req.query.sortBy,
          order: req.query.order,
          ...sortConfig,
        },
        populate,
        select,
        lean,
      })

      // Apply post-processing
      if (afterQuery && typeof afterQuery === 'function') {
        result.data = await afterQuery(result.data, req)
      }

      res.json(result)
    } catch (error) {
      if (error.name === 'CastError') {
        throw badRequest(errorMessages.common.invalidIdFormat('Query parameter'))
      }
      logDatabaseError(error, 'FIND', {
        collection: Model.modelName,
        query: req.query,
        operation: 'paginated_controller',
      })
      throw error
    }
  }
}

module.exports = {
  parsePaginationParams,
  buildSortObject,
  buildPaginationResponse,
  paginate,
  buildQueryFilters,
  createPaginatedController,
  DEFAULT_PAGINATION,
}
