import axios from 'axios'
import { Restaurant, RestaurantListRequest, RestaurantListResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Fetch restaurants with optional filtering, sorting and pagination
 */
export const fetchRestaurants = async (params: RestaurantListRequest = {}): Promise<RestaurantListResponse> => {
    const { page = 1, limit = 10, name, sortBy = 'createdAt', order = 'desc' } = params

    const response = await axios.get<RestaurantListResponse>(`${API_BASE_URL}/api/restaurants`, {
        params: {
            page,
            limit,
            name,
            sortBy,
            order
        }
    })

    return response.data
}

/**
 * Create a new restaurant
 */
export const createRestaurant = async (restaurantData: Omit<Restaurant, '_id' | 'created' | 'updated'>) => {
    const response = await axios.post(`${API_BASE_URL}/api/restaurants`, restaurantData)

    return response.data
} 