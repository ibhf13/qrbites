import apiClient from './client'

export interface Restaurant {
    _id: string
    name: string
    description: string
    address: string
    phone: string
    email: string
    website?: string
    openingHours?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateRestaurantData {
    name: string
    description: string
    address: string
    phone: string
    email: string
    website?: string
    openingHours?: string
}

export interface UpdateRestaurantData {
    name?: string
    description?: string
    address?: string
    phone?: string
    email?: string
    website?: string
    openingHours?: string
    isActive?: boolean
}

export interface RestaurantResponse {
    success: boolean
    data: Restaurant
}

export interface RestaurantsResponse {
    success: boolean
    data: Restaurant[]
}

export const restaurantService = {
    async getRestaurants() {
        const response = await apiClient.get<RestaurantsResponse>('/restaurants')
        return response.data
    },

    async getRestaurant(id: string) {
        const response = await apiClient.get<RestaurantResponse>(`/restaurants/${id}`)
        return response.data
    },

    async createRestaurant(restaurantData: CreateRestaurantData) {
        const response = await apiClient.post<RestaurantResponse>('/restaurants', restaurantData)
        return response.data
    },

    async updateRestaurant(id: string, restaurantData: UpdateRestaurantData) {
        const response = await apiClient.put<RestaurantResponse>(`/restaurants/${id}`, restaurantData)
        return response.data
    },

    async deleteRestaurant(id: string) {
        const response = await apiClient.delete<{ success: boolean }>(`/restaurants/${id}`)
        return response.data
    }
} 