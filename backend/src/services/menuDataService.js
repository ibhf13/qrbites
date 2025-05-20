const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')
const logger = require('@utils/logger')
const { notFound } = require('@utils/errorUtils')

/**
 * Menu data processing service for backend operations
 * Handles complex menu data transformations and business logic
 */

/**
 * Process menu data for public consumption
 * @param {Object} menu - Menu document from database
 * @returns {Object} - Processed menu data
 */
const processMenuForPublic = (menu) => {
    if (!menu) return null

    return {
        id: menu._id,
        name: menu.name,
        description: menu.description,
        imageUrl: menu.imageUrl,
        qrCodeUrl: menu.qrCodeUrl,
        restaurant: menu.restaurantId ? {
            id: menu.restaurantId._id || menu.restaurantId,
            name: menu.restaurantId.name || null
        } : null,
        categories: menu.categories || [],
        isActive: menu.isActive,
        updatedAt: menu.updatedAt
    }
}

/**
 * Get complete menu with items organized by category
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object>} - Complete menu with categorized items
 */
const getCompleteMenuData = async (menuId) => {
    try {
        const menu = await Menu.findById(menuId)
            .populate('restaurantId', 'name description logoUrl address contacts')
            .lean()

        if (!menu) {
            throw notFound('Menu not found')
        }

        const menuItems = await MenuItem.find({ menuId })
            .select('name description price imageUrl category dietary')
            .sort({ category: 1, name: 1 })
            .lean()

        const categories = await MenuItem.distinct('category', { menuId })

        const itemsByCategory = categories.reduce((acc, category) => {
            acc[category] = menuItems.filter(item => item.category === category)
            return acc
        }, {})

        return {
            menu: processMenuForPublic(menu),
            categories,
            itemsByCategory,
            totalItems: menuItems.length
        }
    } catch (error) {
        logger.error(`Error getting complete menu data for ${menuId}:`, error)
        throw error
    }
}

/**
 * Calculate menu statistics
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object>} - Menu statistics
 */
const getMenuStatistics = async (menuId) => {
    try {
        const menuItems = await MenuItem.find({ menuId }).lean()

        const stats = {
            totalItems: menuItems.length,
            categoriesCount: new Set(menuItems.map(item => item.category)).size,
            priceRange: {
                min: Math.min(...menuItems.map(item => item.price || 0)),
                max: Math.max(...menuItems.map(item => item.price || 0)),
                average: menuItems.reduce((sum, item) => sum + (item.price || 0), 0) / menuItems.length
            },
            itemsWithImages: menuItems.filter(item => item.imageUrl).length,
            categoriesDistribution: {}
        }

        menuItems.forEach(item => {
            const category = item.category || 'Uncategorized'
            stats.categoriesDistribution[category] = (stats.categoriesDistribution[category] || 0) + 1
        })

        return stats
    } catch (error) {
        logger.error(`Error calculating menu statistics for ${menuId}:`, error)
        throw error
    }
}

/**
 * Validate menu completeness
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object>} - Validation results
 */
const validateMenuCompleteness = async (menuId) => {
    try {
        const menu = await Menu.findById(menuId).lean()
        const menuItems = await MenuItem.find({ menuId }).lean()

        const validation = {
            isComplete: true,
            issues: [],
            suggestions: []
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

        return validation
    } catch (error) {
        logger.error(`Error validating menu completeness for ${menuId}:`, error)
        throw error
    }
}

module.exports = {
    processMenuForPublic,
    getCompleteMenuData,
    getMenuStatistics,
    validateMenuCompleteness
} 