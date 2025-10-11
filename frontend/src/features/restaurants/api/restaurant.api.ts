import { apiRequest, ApiResponse } from '@/config/api'
import { Restaurant, RestaurantFormData } from '../types/restaurant.types'
import { withErrorHandling } from '@/utils/apiUtils'

export const getRestaurants = async (): Promise<ApiResponse<Restaurant[]>> => {
    return withErrorHandling(async () => {
        return apiRequest<Restaurant[]>({
            method: 'GET',
            url: '/api/restaurants'
        })
    }, 'Failed to fetch restaurants')
}

export const getRestaurant = async (id: string): Promise<ApiResponse<Restaurant>> => {
    return withErrorHandling(async () => {
        return apiRequest<Restaurant>({
            method: 'GET',
            url: `/api/restaurants/${id}`
        })
    }, `Failed to fetch restaurant with id: ${id}`)
}

const processFormDataForSubmission = (data: RestaurantFormData): FormData => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (key === 'contact' && value) {
            const contact = value as Record<string, string>

            Object.entries(contact).forEach(([contactKey, contactValue]) => {
                if (contactValue && contactValue.trim()) {
                    formData.append(`contact[${contactKey}]`, contactValue.trim())
                }
            })
        } else if (key === 'location' && value) {
            const location = value as Record<string, string>

            Object.entries(location).forEach(([locationKey, locationValue]) => {
                if (locationValue && locationValue.trim()) {
                    const formKey = `location[${locationKey}]`
                    const formValue = locationValue.trim()

                    formData.append(formKey, formValue)
                }
            })
        } else if (key === 'hours' && Array.isArray(value)) {
            value.forEach((hour, index) => {
                formData.append(`hours[${index}][day]`, hour.day.toString())
                formData.append(`hours[${index}][closed]`, hour.closed.toString())
                if (!hour.closed) {
                    if (hour.open) formData.append(`hours[${index}][open]`, hour.open)
                    if (hour.close) formData.append(`hours[${index}][close]`, hour.close)
                }
            })
        } else if (key === 'logo' && value instanceof File) {
            formData.append('logo', value)
        } else if (key === 'description' && typeof value === 'string') {
            formData.append(key, value.trim())
        } else if (value && key !== 'logo' && typeof value === 'string') {
            formData.append(key, value.trim())
        } else if (typeof value === 'boolean') {
            formData.append(key, value.toString())
        }
    })

    return formData
}

export const createRestaurant = async (data: RestaurantFormData): Promise<ApiResponse<Restaurant>> => {
    return withErrorHandling(async () => {
        const formData = processFormDataForSubmission(data)

        return apiRequest<Restaurant>({
            method: 'POST',
            url: '/api/restaurants',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }, 'Failed to create restaurant')
}

export const updateRestaurant = async (id: string, data: RestaurantFormData): Promise<ApiResponse<Restaurant>> => {
    return withErrorHandling(async () => {
        const formData = processFormDataForSubmission(data)

        return apiRequest<Restaurant>({
            method: 'PUT',
            url: `/api/restaurants/${id}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }, `Failed to update restaurant with id: ${id}`)
}

export const deleteRestaurant = async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return withErrorHandling(async () => {
        return apiRequest<{ message: string }>({
            method: 'DELETE',
            url: `/api/restaurants/${id}`
        })
    }, `Failed to delete restaurant with id: ${id}`)
}

export const uploadRestaurantLogo = async (id: string, logo: File): Promise<ApiResponse<Restaurant>> => {
    return withErrorHandling(async () => {
        const formData = new FormData()

        formData.append('logo', logo)

        return apiRequest<Restaurant>({
            method: 'POST',
            url: `/api/restaurants/${id}/logo`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }, `Failed to upload logo for restaurant with id: ${id}`)
} 