/**
 * Restaurant types based on API contract
 */

export interface Restaurant {
    _id: string
    name: string
    description?: string
    logoUrl?: string
    location?: {
        address?: string
        city?: string
        state?: string
        zipCode?: string
        country?: string
    }
    created: string
    updated: string
}

export interface RestaurantListRequest {
    page?: number
    limit?: number
    name?: string
    sortBy?: string
    order?: 'asc' | 'desc'
}

export interface PaginationData {
    page: number
    limit: number
    total: number
    pages: number
}

export interface RestaurantListResponse {
    success: boolean
    data: Restaurant[]
    pagination: PaginationData
} 