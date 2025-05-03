import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchRestaurants } from '../api/restaurantsApi'
import { RestaurantListRequest } from '../types'

/**
 * Custom hook for fetching and managing restaurant data
 */
export const useRestaurants = (initialParams: RestaurantListRequest = {}) => {
    const [queryParams, setQueryParams] = useState<RestaurantListRequest>({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
        ...initialParams
    })

    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['restaurants', queryParams],
        queryFn: () => fetchRestaurants(queryParams)
    })

    // Update search params and trigger refetch
    const updateParams = (newParams: Partial<RestaurantListRequest>) => {
        setQueryParams(prev => ({
            ...prev,
            ...newParams,
            // Reset to page 1 when changing search or filters
            ...(newParams.name !== undefined && { page: 1 })
        }))
    }

    // Handle pagination
    const goToPage = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }))
    }

    return {
        restaurants: data?.data || [],
        pagination: data?.pagination,
        isLoading,
        isError,
        error,
        queryParams,
        updateParams,
        goToPage,
        refetch
    }
} 