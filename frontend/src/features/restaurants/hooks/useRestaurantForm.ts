import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FORM_DEFAULT_VALUES } from '../constants/restaurant.const'
import { RestaurantFormData, RestaurantFormMode } from '../types/restaurant.types'
import { restaurantFormSchema, validateLogoFile } from '../validations/restaurant.validation'

export const useRestaurantForm = (
    mode: RestaurantFormMode,
    initialData?: Partial<RestaurantFormData>,
    onSubmit?: (data: RestaurantFormData) => Promise<void>,
    existingLogoUrl?: string
) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(existingLogoUrl || null)
    const [formError, setFormError] = useState<string | null>(null)

    const methods = useForm<RestaurantFormData>({
        resolver: zodResolver(restaurantFormSchema),
        defaultValues: initialData || FORM_DEFAULT_VALUES,
        mode: 'onBlur',
    })

    useEffect(() => {
        if (initialData) {
            methods.reset(initialData)
        }
    }, [initialData, methods])

    const validateCurrentStep = async () => {
        const formData = methods.getValues()

        switch (currentStep) {
            case 0:
                return await methods.trigger(['name', 'description', 'contact'])
            case 1:
                const locationValid = await methods.trigger(['location.street', 'location.houseNumber', 'location.city', 'location.zipCode'])

                if (!locationValid) {
                    setFormError('Please fill in all required location fields before proceeding.')

                    return false
                }

                const location = formData.location

                if (!location?.street?.trim() || !location?.houseNumber?.trim() || !location?.city?.trim() || !location?.zipCode?.trim()) {
                    setFormError('All location fields (street, city, zip code) are required.')

                    return false
                }

                return true
            case 2:
                return await methods.trigger(['hours'])
            default:
                return true
        }
    }

    const nextStep = async () => {
        if (currentStep < 3) {
            setFormError(null)
            const isValid = await validateCurrentStep()

            if (isValid) {
                setCurrentStep(currentStep + 1)
            }
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setFormError(null)
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = async (targetStep: number) => {
        if (targetStep < 0 || targetStep > 3) return

        setFormError(null)

        if (targetStep < currentStep) {
            setCurrentStep(targetStep)

            return
        }

        for (let step = currentStep; step < targetStep; step++) {
            const originalStep = currentStep

            setCurrentStep(step)
            const isValid = await validateCurrentStep()

            if (!isValid) {
                setCurrentStep(originalStep)

                return
            }
        }

        setCurrentStep(targetStep)
    }

    const handleLogoChange = (file: File | null) => {
        try {
            if (file) {
                validateLogoFile(file)
                setLogoFile(file)
                const previewUrl = URL.createObjectURL(file)

                setLogoPreview(previewUrl)
            } else {
                setLogoFile(null)
                setLogoPreview(existingLogoUrl || null)
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
            const formData = {
                ...data,
                logo: logoFile || undefined
            }

            await onSubmit(formData)

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
        goToStep,
        handleLogoChange,
        handleSubmit,
    }
} 