import React from 'react'
import { FormDialog } from '@/components/common/dialogs'
import { Restaurant } from '../types/restaurant.types'
import RestaurantCreationForm from './RestaurantCreationForm'
import RestaurantEditForm from './RestaurantEditForm'

interface RestaurantFormDialogProps {
    isOpen: boolean
    onClose: () => void
    mode: 'create' | 'edit'
    restaurantData?: Restaurant
}

const RestaurantFormDialog: React.FC<RestaurantFormDialogProps> = ({
    isOpen,
    onClose,
    mode,
    restaurantData
}) => {
    const title = mode === 'create'
        ? 'Add New Restaurant'
        : `Edit Restaurant: ${restaurantData?.name || ''}`

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="4xl"
        >
            {mode === 'edit' && restaurantData ? (
                <RestaurantEditForm
                    restaurant={restaurantData}
                    onClose={onClose}
                />
            ) : (
                <RestaurantCreationForm onClose={onClose} />
            )}
        </FormDialog>
    )
}

export default RestaurantFormDialog 