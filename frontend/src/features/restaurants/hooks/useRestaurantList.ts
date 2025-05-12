import { useEffect, useState } from 'react'
import { API_ENDPOINTS } from '../constants/restaurant.const'
import { Restaurant } from '../types/restaurant.types'

export type SortOption = 'name' | 'createdAt' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'

interface UseRestaurantListOptions {
    searchQuery?: string
    filters?: {
        city?: string
        state?: string
        country?: string
        isActive?: boolean
    }
    sortBy?: SortOption
    sortOrder?: SortOrder
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
    refreshList: () => Promise<void>
    handleSearch: (query: string) => void
    sortBy: SortOption
    order: SortOrder
    setSorting: (sortBy: SortOption) => void
    pagination: {
        pages: number
        current: number
        total: number
    }
    deleteRestaurant: (id: string) => Promise<void>
}

export const useRestaurantList = (options: UseRestaurantListOptions = {}): UseRestaurantListResult => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(options.initialPage || 1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchQuery, setSearchQuery] = useState(options.searchQuery || '')
    const [sortBy, setSortBy] = useState<SortOption>(options.sortBy || 'name')
    const [sortOrder, setSortOrder] = useState<SortOrder>(options.sortOrder || 'asc')
    const [limit] = useState(options.initialLimit || 10)

    const fetchRestaurants = async (page: number = 1) => {
        setIsLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('auth_token')
            const baseUrl = import.meta.env.VITE_API_URL || ''

            // Build query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(searchQuery && { search: searchQuery }),
                ...(options.filters?.city && { city: options.filters.city }),
                ...(options.filters?.state && { state: options.filters.state }),
                ...(options.filters?.country && { country: options.filters.country }),
                ...(options.filters?.isActive !== undefined && { isActive: options.filters.isActive.toString() }),
                sortBy,
                sortOrder,
            })

            const response = await fetch(
                `${baseUrl}${API_ENDPOINTS.RESTAURANTS}?${queryParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch restaurants')
            }

            const data = await response.json()
            if (data.success && data.data) {
                setRestaurants(data.data)
                setTotalCount(data.total)
                setTotalPages(Math.ceil(data.total / limit))
                setCurrentPage(page)
            } else {
                throw new Error(data.error || 'Failed to fetch restaurants')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching restaurants')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRestaurants(currentPage)
    }, [currentPage, searchQuery, options.filters, sortBy, sortOrder])

    const refreshList = async () => {
        await fetchRestaurants(currentPage)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page on new search
    }

    const setSorting = (newSortBy: SortOption) => {
        if (newSortBy === sortBy) {
            // Toggle sort order if clicking the same sort option
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(newSortBy)
            setSortOrder('asc') // Default to ascending for new sort field
        }
        setCurrentPage(1) // Reset to first page on sort change
    }

    const deleteRestaurant = async (id: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            const baseUrl = import.meta.env.VITE_API_URL || ''
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.RESTAURANT_DETAIL(id)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete restaurant')
            }

            // Refresh the list after successful deletion
            await refreshList()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while deleting restaurant')
            throw err
        }
    }

    return {
        restaurants,
        isLoading,
        error,
        totalCount,
        currentPage,
        totalPages,
        setPage: setCurrentPage,
        refreshList,
        handleSearch,
        sortBy,
        order: sortOrder,
        setSorting,
        pagination: {
            pages: totalPages,
            current: currentPage,
            total: totalCount
        },
        deleteRestaurant
    }
} 