import React from 'react'
import { useCreateRestaurant } from '../hooks/useRestaurants'
import { RestaurantFormData } from '../types/restaurant.types'
import { useNotificationActions } from '@/features/notifications'
import BaseRestaurantForm from './BaseRestaurantForm'

interface RestaurantCreationFormProps {
    onClose?: () => void
}

const RestaurantCreationForm: React.FC<RestaurantCreationFormProps> = ({ onClose }) => {
    const { showError } = useNotificationActions()
    const createRestaurant = useCreateRestaurant()

    const handleSubmit = async (data: RestaurantFormData) => {
        try {
            await createRestaurant.mutateAsync(data)
            if (onClose) {
                onClose()
            }
        } catch (error) {
            console.error('Error creating restaurant:', error)
            showError(error instanceof Error ? error.message : 'Failed to create restaurant')
            throw error
        }
    }

    return (
        <BaseRestaurantForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={onClose}
        />
    )
}

export default RestaurantCreationForm 