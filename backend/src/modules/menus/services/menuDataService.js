const Menu = require('@modules/menus/models/menu')
const MenuItem = require('@modules/menuItems/models/menuItem')
const logger = require('@commonUtils/logger')
const { notFound, badRequest, errorMessages, logDatabaseError } = require('@errors')

/**
 * Menu data processing service for backend operations
 * Handles complex menu data transformations and business logic
 */

/**
 * Process menu data for public consumption
 * @param {Object} menu - Menu document from database
 * @returns {Object} - Processed menu data
 */
const processMenuForPublic = menu => {
  if (!menu) {
    logger.debug('processMenuForPublic called with null/undefined menu')
    return null
  }

  logger.debug('Processing menu for public consumption', {
    menuId: menu._id,
    hasRestaurant: !!menu.restaurantId,
    hasImage: !!menu.imageUrl,
    hasQrCode: !!menu.qrCodeUrl,
  })

  return {
    id: menu._id,
    name: menu.name,
    description: menu.description,
    imageUrl: menu.imageUrl,
    qrCodeUrl: menu.qrCodeUrl,
    restaurant: menu.restaurantId
      ? {
        id: menu.restaurantId.id || menu.restaurantId._id || menu.restaurantId,
        name: menu.restaurantId.name || null,
      }
      : null,
    categories: menu.categories || [],
    isActive: menu.isActive,
    updatedAt: menu.updatedAt,
  }
}

/**
 * Get complete menu with items organized by category
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object>} - Complete menu with categorized items
 */
const getCompleteMenuData = async menuId => {
  try {
    logger.info('Fetching complete menu data', { menuId })

    const menu = await Menu.findOne({ _id: menuId, isActive: true })
      .populate('restaurantId', 'name description logoUrl address contacts id')
      .lean()

    if (!menu) {
      logger.warn('Menu not found or inactive', { menuId })
      throw notFound('Menu not found')
    }

    const menuItems = await MenuItem.find({
      menuId,
      isAvailable: true,
    })
      .select('name description price imageUrl category')
      .sort({ category: 1, name: 1 })
      .lean()

    let categories = await MenuItem.distinct('category', {
      menuId,
      isAvailable: true,
    })
    categories = categories.filter(Boolean)

    const itemsByCategory = categories.reduce((acc, category) => {
      acc[category] = menuItems.filter(item => item.category === category)
      return acc
    }, {})

    const uncategorized = menuItems.filter(item => !item.category)
    if (uncategorized.length) {
      itemsByCategory['Uncategorized'] = uncategorized
      categories.push('Uncategorized')
      logger.warn('Found uncategorized menu items', {
        menuId,
        uncategorizedCount: uncategorized.length,
      })
    }

    const result = {
      menu: processMenuForPublic(menu),
      categories,
      itemsByCategory,
      totalItems: menuItems.length,
    }

    logger.success('Complete menu data retrieved successfully', {
      menuId,
      totalItems: menuItems.length,
      categoriesCount: categories.length,
      restaurantId: menu.restaurantId?._id,
    })

    return result
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
    }
    logDatabaseError(error, 'FIND', {
      collection: 'menus',
      id: menuId,
      operation: 'get_complete_menu_data',
    })
    throw error
  }
}

/**
 * Calculate menu statistics
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object>} - Menu statistics
 */
const getMenuStatistics = async menuId => {
  try {
    logger.debug('Calculating menu statistics', { menuId })

    const menuItems = await MenuItem.find({ menuId }).lean()

    // Guard against division by zero
    const totalPrice = menuItems.reduce((sum, item) => sum + (item.price || 0), 0)
    const averagePrice = menuItems.length > 0 ? totalPrice / menuItems.length : 0

    const stats = {
      totalItems: menuItems.length,
      categoriesCount: new Set(menuItems.map(item => item.category)).size,
      priceRange: {
        min: menuItems.length > 0 ? Math.min(...menuItems.map(item => item.price || 0)) : 0,
        max: menuItems.length > 0 ? Math.max(...menuItems.map(item => item.price || 0)) : 0,
        average: averagePrice,
      },
      itemsWithImages: menuItems.filter(item => item.imageUrl).length,
      categoriesDistribution: {},
    }

    menuItems.forEach(item => {
      const category = item.category || 'Uncategorized'
      stats.categoriesDistribution[category] = (stats.categoriesDistribution[category] || 0) + 1
    })

    // Log warning if menu has no items
    if (stats.totalItems === 0) {
      logger.warn('Menu statistics calculated for empty menu', { menuId })
    }

    logger.info('Menu statistics calculated successfully', {
      menuId,
      totalItems: stats.totalItems,
      categoriesCount: stats.categoriesCount,
      averagePrice: Math.round(stats.priceRange.average * 100) / 100,
    })

    return stats
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
    }
    logDatabaseError(error, 'FIND', {
      collection: 'menuItems',
      id: menuId,
      operation: 'get_menu_statistics',
    })
    throw error
  }
}

/**
 * Validate menu completeness
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object>} - Validation results
 */
const validateMenuCompleteness = async menuId => {
  try {
    logger.debug('Validating menu completeness', { menuId })

    const menu = await Menu.findById(menuId).lean()
    const menuItems = await MenuItem.find({ menuId }).lean()

    const validation = {
      isComplete: true,
      issues: [],
      suggestions: [],
    }

    if (!menu.description) {
      validation.issues.push('Menu missing description')
      validation.isComplete = false
    }

    if (!menu.imageUrl) {
      validation.suggestions.push('Consider adding a menu image')
    }

    if (!menu.qrCodeUrl) {
      validation.issues.push('Menu missing QR code')
      validation.isComplete = false
    }

    if (menuItems.length === 0) {
      validation.issues.push('Menu has no items')
      validation.isComplete = false
    }

    const itemsWithoutPrices = menuItems.filter(item => !item.price || item.price <= 0)
    if (itemsWithoutPrices.length > 0) {
      validation.issues.push(`${itemsWithoutPrices.length} items missing prices`)
    }

    const itemsWithoutDescriptions = menuItems.filter(item => !item.description)
    if (itemsWithoutDescriptions.length > 0) {
      validation.suggestions.push(`${itemsWithoutDescriptions.length} items could use descriptions`)
    }

    // Log validation results
    if (validation.isComplete) {
      logger.success('Menu validation passed - menu is complete', {
        menuId,
        totalItems: menuItems.length,
      })
    } else {
      logger.warn('Menu validation failed - issues found', {
        menuId,
        issuesCount: validation.issues.length,
        suggestionsCount: validation.suggestions.length,
        issues: validation.issues,
      })
    }

    return validation
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
    }
    logDatabaseError(error, 'FIND', {
      collection: 'menus',
      id: menuId,
      operation: 'validate_menu_completeness',
    })
    throw error
  }
}

module.exports = {
  processMenuForPublic,
  getCompleteMenuData,
  getMenuStatistics,
  validateMenuCompleteness,
}
