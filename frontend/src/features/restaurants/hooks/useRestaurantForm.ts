import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FORM_DEFAULT_VALUES } from '../constants/restaurant.const'
import { RestaurantFormData, RestaurantFormMode } from '../types/restaurant.types'
import { restaurantFormSchema, validateLogoFile } from '../validations/restaurant.validation'

export const useRestaurantForm = (
    mode: RestaurantFormMode,
    initialData?: Partial<RestaurantFormData>,
    onSubmit?: (data: RestaurantFormData) => Promise<void>
) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo?.toString() || null)
    const [formError, setFormError] = useState<string | null>(null)

    const methods = useForm<RestaurantFormData>({
        resolver: zodResolver(restaurantFormSchema),
        defaultValues: initialData || FORM_DEFAULT_VALUES,
        mode: 'onBlur',
    })

    const nextStep = () => {
        if (currentStep < 3) { // Total steps - 1
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleLogoChange = (file: File | null) => {
        try {
            if (file) {
                validateLogoFile(file)
                setLogoFile(file)
                // Create preview URL
                const previewUrl = URL.createObjectURL(file)
                setLogoPreview(previewUrl)
            } else {
                setLogoFile(null)
                setLogoPreview(initialData?.logo?.toString() || null)
            }
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Invalid logo file')
        }
    }

    const handleSubmit = async (data: RestaurantFormData) => {
        if (!onSubmit) return

        setIsSubmitting(true)
        setFormError(null)

        try {
            // Add logo file to the form data if available
            const formData = {
                ...data,
                logo: logoFile || undefined
            }

            await onSubmit(formData)

            // Clean up logo preview URL if it was created
            if (logoFile && logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview)
            }
        } catch (error) {
            console.error(`Error ${mode}ing restaurant:`, error)
            setFormError(error instanceof Error ? error.message : 'An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        methods,
        currentStep,
        isSubmitting,
        logoFile,
        logoPreview,
        formError,
        nextStep,
        prevStep,
        handleLogoChange,
        handleSubmit,
    }
} 