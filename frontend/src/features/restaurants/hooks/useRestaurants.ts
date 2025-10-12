/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createRestaurant,
    deleteRestaurant,
    getRestaurant,
    getRestaurants,
    updateRestaurant,
    uploadRestaurantLogo
} from '../api/restaurant.api'
import { RestaurantFormData } from '../types/restaurant.types'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'

export const useRestaurants = () => {

    return useQuery({
        queryKey: ['restaurants'],
        queryFn: () => getRestaurants(),
        select: (data) => ({
            restaurants: data.success ? data.data : [],
            total: data.success ? data.total : 0,
            page: data.success ? data.page : 1,
            limit: data.success ? data.limit : 10
        }),
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
    })
}

export const useRestaurant = (id: string) => {
    return useQuery({
        queryKey: ['restaurant', id],
        queryFn: () => getRestaurant(id),
        select: (data) => data.success ? data.data : null,
        enabled: !!id
    })
}

export const useCreateRestaurant = () => {
    const { showError, showSuccess } = useNotificationContext()

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createRestaurant,
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['restaurants'] })
                queryClient.invalidateQueries({ queryKey: ['restaurant', response.data._id] })
                showSuccess('Restaurant created successfully')
            }
        },
        onError: (error: any) => {
            console.error('❌ Create restaurant error:', error)
            showError(error.message)
        }
    })
}

export const useUpdateRestaurant = () => {
    const { showError, showSuccess } = useNotificationContext()

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RestaurantFormData }) =>
            updateRestaurant(id, data),
        onSuccess: (response, variables) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['restaurants'] })
                queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] })
                showSuccess('Restaurant updated successfully')
            }
        },
        onError: (error: any) => {
            console.error('❌ Update restaurant error:', error)
            showError(error.message)
        }
    })
}

export const useDeleteRestaurant = () => {
    const { showError, showSuccess } = useNotificationContext()

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteRestaurant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] })
            showSuccess('Restaurant deleted successfully')
        },
        onError: (error: any) => {
            console.error('❌ Delete restaurant error:', error)
            showError(error.message)
        }
    })
}

export const useUploadRestaurantLogo = () => {
    const { showError, showSuccess } = useNotificationContext()

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, logo }: { id: string; logo: File }) =>
            uploadRestaurantLogo(id, logo),
        onSuccess: (response, variables) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['restaurants'] })
                queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] })
                showSuccess('Restaurant logo uploaded successfully')
            }
        },
        onError: (error: any) => {
            console.error('❌ Upload restaurant logo error:', error)
            showError(error.message)
        }
    })
}
