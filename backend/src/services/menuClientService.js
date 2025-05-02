const axios = require('axios')
const logger = require('@utils/logger')

// Base URL for API calls
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'

/**
 * Menu client service for frontend applications
 * Provides methods to interact with the menu API
 */
const menuClientService = {
    /**
     * Get all menus with optional filtering
     * @param {Object} filters - Query filters (name, restaurantId, page, limit, sortBy, order)
     * @returns {Promise<Object>} - Menus list and pagination data
     */
    async getMenus(filters = {}) {
        try {
            const queryParams = new URLSearchParams()

            // Add filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value)
                }
            })

            const response = await axios.get(`${API_BASE_URL}/menus?${queryParams.toString()}`)
            return response.data
        } catch (error) {
            logger.error('Error fetching menus:', error.message)
            throw error
        }
    },

    /**
     * Get menu by ID
     * @param {string} id - Menu ID
     * @returns {Promise<Object>} - Menu details
     */
    async getMenuById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/menus/${id}`)
            return response.data
        } catch (error) {
            logger.error(`Error fetching menu ${id}:`, error.message)
            throw error
        }
    },

    /**
     * Create a new menu
     * @param {Object} menuData - Menu data
     * @param {File} image - Optional menu image
     * @returns {Promise<Object>} - Created menu
     */
    async createMenu(menuData, image = null) {
        try {
            let response

            if (image) {
                // Create FormData to handle file upload
                const formData = new FormData()

                // Add menu data
                Object.entries(menuData).forEach(([key, value]) => {
                    formData.append(key, value)
                })

                // Add image file
                formData.append('image', image)

                response = await axios.post(`${API_BASE_URL}/menus`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
            } else {
                response = await axios.post(`${API_BASE_URL}/menus`, menuData)
            }

            return response.data
        } catch (error) {
            logger.error('Error creating menu:', error.message)
            throw error
        }
    },

    /**
     * Update an existing menu
     * @param {string} id - Menu ID
     * @param {Object} menuData - Updated menu data
     * @param {File} image - Optional menu image
     * @returns {Promise<Object>} - Updated menu
     */
    async updateMenu(id, menuData, image = null) {
        try {
            let response

            if (image) {
                // Create FormData to handle file upload
                const formData = new FormData()

                // Add menu data
                Object.entries(menuData).forEach(([key, value]) => {
                    formData.append(key, value)
                })

                // Add image file
                formData.append('image', image)

                response = await axios.put(`${API_BASE_URL}/menus/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
            } else {
                response = await axios.put(`${API_BASE_URL}/menus/${id}`, menuData)
            }

            return response.data
        } catch (error) {
            logger.error(`Error updating menu ${id}:`, error.message)
            throw error
        }
    },

    /**
     * Delete a menu
     * @param {string} id - Menu ID
     * @returns {Promise<void>}
     */
    async deleteMenu(id) {
        try {
            await axios.delete(`${API_BASE_URL}/menus/${id}`)
        } catch (error) {
            logger.error(`Error deleting menu ${id}:`, error.message)
            throw error
        }
    },

    /**
     * Upload an image for a menu
     * @param {string} id - Menu ID
     * @param {File} image - Menu image file
     * @returns {Promise<Object>} - Object with image URL
     */
    async uploadImage(id, image) {
        try {
            const formData = new FormData()
            formData.append('image', image)

            const response = await axios.post(`${API_BASE_URL}/menus/${id}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            return response.data
        } catch (error) {
            logger.error(`Error uploading image for menu ${id}:`, error.message)
            throw error
        }
    },

    /**
     * Generate a QR code for a menu
     * @param {string} id - Menu ID
     * @returns {Promise<Object>} - Object with QR code URL
     */
    async generateQRCode(id) {
        try {
            const response = await axios.post(`${API_BASE_URL}/menus/${id}/qrcode`)
            return response.data
        } catch (error) {
            logger.error(`Error generating QR code for menu ${id}:`, error.message)
            throw error
        }
    },

    /**
     * Get the menu items for a specific menu
     * @param {string} menuId - Menu ID
     * @returns {Promise<Object>} - Menu items
     */
    async getMenuItems(menuId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-items?menuId=${menuId}`)
            return response.data
        } catch (error) {
            logger.error(`Error fetching menu items for menu ${menuId}:`, error.message)
            throw error
        }
    }
}

module.exports = menuClientService 