import { useState } from 'react'
import { Restaurant } from '../types/restaurant.types'
import { useDeleteRestaurant, useRestaurants } from './useRestaurants'


interface UseRestaurantListOptions {
    searchQuery?: string
    filters?: {
        city?: string
        state?: string
        isActive?: boolean
    }
    initialPage?: number
    initialLimit?: number
}

interface UseRestaurantListResult {
    restaurants: Restaurant[]
    isLoading: boolean
    error: string | null
    totalCount: number
    currentPage: number
    totalPages: number
    setPage: (page: number) => void
    refreshList: () => void
    deleteRestaurant: (id: string) => Promise<void>
}

export const useRestaurantList = (options: UseRestaurantListOptions = {}): UseRestaurantListResult => {
    const [currentPage, setCurrentPage] = useState(options.initialPage || 1)
    const [limit] = useState(options.initialLimit || 10)

    const { data, isLoading, error, refetch } = useRestaurants()

    const deleteMutation = useDeleteRestaurant()

    const deleteRestaurant = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
        } catch (err) {
            throw err
        }
    }

    const totalPages = data ? Math.ceil(data.restaurants.length / limit) : 1

    return {
        restaurants: data?.restaurants || [],
        isLoading,
        error: error ? (error as Error).message : null,
        totalCount: data?.restaurants.length || 0,
        currentPage,
        totalPages,
        setPage: setCurrentPage,
        refreshList: () => refetch(),
        deleteRestaurant
    }
} 