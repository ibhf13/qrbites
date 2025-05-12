import { useEffect, useState } from 'react'
import { API_ENDPOINTS } from '../constants/restaurant.const'
import { Restaurant, RestaurantFormData } from '../types/restaurant.types'

interface UseRestaurantResult {
    restaurant: Restaurant | null
    isLoading: boolean
    error: string | null
    updateRestaurant: (data: RestaurantFormData) => Promise<void>
    deleteRestaurant: () => Promise<void>
    isUpdating: boolean
    isDeleting: boolean
}

export const useRestaurant = (id: string): UseRestaurantResult => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchRestaurant = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const token = localStorage.getItem('auth_token')
                const baseUrl = import.meta.env.VITE_API_URL || ''
                const response = await fetch(`${baseUrl}${API_ENDPOINTS.RESTAURANT_DETAIL(id)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch restaurant data')
                }

                const data = await response.json()
                setRestaurant(data.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching restaurant data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRestaurant()
    }, [id])

    const updateRestaurant = async (data: RestaurantFormData) => {
        setIsUpdating(true)
        setError(null)

        try {
            const token = localStorage.getItem('auth_token')
            const baseUrl = import.meta.env.VITE_API_URL || ''
            const formData = new FormData()

            // Add form fields
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'contact' || key === 'location') {
                    Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
                        if (subValue) {
                            formData.append(`${key}[${subKey}]`, subValue)
                        }
                    })
                } else if (key === 'hours') {
                    (value as Array<{ day: number; open?: string; close?: string; closed: boolean }>).forEach((hour, index) => {
                        formData.append(`hours[${index}][day]`, hour.day.toString())
                        formData.append(`hours[${index}][closed]`, hour.closed.toString())
                        if (!hour.closed) {
                            if (hour.open) formData.append(`hours[${index}][open]`, hour.open)
                            if (hour.close) formData.append(`hours[${index}][close]`, hour.close)
                        }
                    })
                } else if (value) {
                    formData.append(key, value.toString())
                }
            })

            const response = await fetch(`${baseUrl}${API_ENDPOINTS.RESTAURANT_DETAIL(id)}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to update restaurant')
            }

            const responseData = await response.json()
            setRestaurant(responseData.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating restaurant')
            throw err
        } finally {
            setIsUpdating(false)
        }
    }

    const deleteRestaurant = async () => {
        setIsDeleting(true)
        setError(null)

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

            setRestaurant(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while deleting restaurant')
            throw err
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        restaurant,
        isLoading,
        error,
        updateRestaurant,
        deleteRestaurant,
        isUpdating,
        isDeleting,
    }
} 