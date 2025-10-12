import React from 'react'
import { useUpdateRestaurant, useUploadRestaurantLogo } from '../hooks/useRestaurants'
import { Restaurant, RestaurantFormData } from '../types/restaurant.types'
import BaseRestaurantForm from './BaseRestaurantForm'
import { useNotificationActions } from '@/features/notifications'

interface RestaurantEditFormProps {
    restaurant: Restaurant
    onClose: () => void
}

const RestaurantEditForm: React.FC<RestaurantEditFormProps> = ({ restaurant, onClose }) => {
    const { showError } = useNotificationActions()

    const updateRestaurantMutation = useUpdateRestaurant()
    const uploadLogoMutation = useUploadRestaurantLogo()

    const handleSubmit = async (data: RestaurantFormData) => {
        try {
            await updateRestaurantMutation.mutateAsync({
                id: restaurant._id,
                data: { ...data, logo: undefined }
            })

            if (data.logo instanceof File) {
                await uploadLogoMutation.mutateAsync({
                    id: restaurant._id,
                    logo: data.logo
                })
            }

            onClose()
        } catch (error) {
            console.error('Error updating restaurant:', error)
            showError(error instanceof Error ? error.message : 'Failed to update restaurant')
            throw error
        }
    }

    const formData: Partial<RestaurantFormData> = {
        name: restaurant.name,
        description: restaurant.description,
        contact: restaurant.contact,
        location: restaurant.location,
        hours: restaurant.hours,
        isActive: restaurant.isActive
    }

    return (
        <BaseRestaurantForm
            mode="edit"
            initialData={{
                ...formData,
                id: restaurant._id,
                logoUrl: restaurant.logoUrl
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any}
            onSubmit={handleSubmit}
            onCancel={onClose}
        />
    )
}

export default RestaurantEditForm 