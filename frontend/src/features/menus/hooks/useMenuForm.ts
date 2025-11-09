import { useState } from 'react'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { useCreateMenu, useUpdateMenu } from './useMenus'
import { MenuFormData } from '../types/menu.types'

interface UseMenuFormProps {
    restaurantId?: string
    initialData?: Partial<MenuFormData>
    onSuccess?: () => void
    mode?: 'create' | 'edit'
    menuId?: string
}

interface FormErrors {
    [key: string]: string
}

export const useMenuForm = ({
    restaurantId,
    initialData,
    onSuccess,
    mode = 'create',
    menuId
}: UseMenuFormProps) => {
    const { showSuccess, showError } = useNotificationContext()
    const createMutation = useCreateMenu()
    const updateMutation = useUpdateMenu()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formData, setFormData] = useState<MenuFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        restaurantId: initialData?.restaurantId || restaurantId || '',
        isActive: initialData?.isActive ?? true,
        categories: initialData?.categories || [],
        image: undefined
    })
    const [errors, setErrors] = useState<FormErrors>({})

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Menu name is required'
        } else if (formData.name.length < 3) {
            newErrors.name = 'Menu name must be at least 3 characters'
        } else if (formData.name.length > 50) {
            newErrors.name = 'Menu name cannot exceed 50 characters'
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters'
        }

        if (mode === 'create' && !formData.restaurantId) {
            newErrors.restaurantId = 'Restaurant is required'
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const resetForm = () => {
        setFormData({
            name: initialData?.name || '',
            description: initialData?.description || '',
            restaurantId: initialData?.restaurantId || restaurantId || '',
            isActive: initialData?.isActive ?? true,
            categories: initialData?.categories || [],
            image: undefined
        })
        setErrors({})
    }

    const openForm = () => {
        setIsFormOpen(true)
        resetForm()
    }

    const closeForm = () => {
        setIsFormOpen(false)
        resetForm()
    }

    const toggleForm = () => {
        if (isFormOpen) {
            closeForm()
        } else {
            openForm()
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleFileChange = (files: File[]) => {
        setFormData(prev => ({
            ...prev,
            image: files[0] || undefined
        }))
    }

    const handleCategoriesChange = (categories: string[]) => {
        setFormData(prev => ({
            ...prev,
            categories
        }))
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            if (mode === 'create') {
                console.log('🚀 Creating menu with data:', formData)
                const result = await createMutation.mutateAsync(formData)

                console.log('✅ Menu creation result:', result)

                showSuccess('Menu created successfully!')
                closeForm()
                onSuccess?.()
            } else if (mode === 'edit' && menuId) {
                const { image, ...updateData } = formData
                const finalUpdateData = image ? { ...updateData, image } : updateData

                console.log('🚀 Updating menu with data:', finalUpdateData)
                const result = await updateMutation.mutateAsync({ id: menuId, data: finalUpdateData })

                console.log('✅ Menu update result:', result)

                showSuccess('Menu updated successfully!')
                closeForm()
                onSuccess?.()
            } else {
                throw new Error('Menu ID is required for edit mode')
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(`❌ Menu ${mode} error:`, error)
            console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                config: error?.config?.url
            })

            const errorMessage = error?.response?.data?.error?.message
                || error?.response?.data?.message
                || error?.message
                || `Failed to ${mode} menu`

            showError(errorMessage)
        }
    }

    const updateFormData = (data: MenuFormData) => {
        setFormData(data)
    }

    return {
        isFormOpen,
        formData,
        errors,
        isSubmitting: mode === 'create' ? createMutation.isPending : updateMutation.isPending,
        isValid: Object.keys(errors).length === 0,

        openForm,
        closeForm,
        toggleForm,
        handleSubmit,
        handleInputChange,
        handleFileChange,
        handleCategoriesChange,
        updateFormData,
        resetForm,
        validateForm
    }
}

export default useMenuForm 