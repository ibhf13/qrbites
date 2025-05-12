import React from 'react'
import { FormProvider } from 'react-hook-form'
import { RESTAURANT_FORM_STEPS } from '../constants/restaurant.const'
import { useRestaurantForm } from '../hooks/useRestaurantForm'
import { RestaurantFormData, RestaurantFormMode } from '../types/restaurant.types'
import BasicInfoStep from './form-steps/BasicInfoStep'
import FormStepper from './form-steps/FormStepper'
import HoursStep from './form-steps/HoursStep'
import LocationStep from './form-steps/LocationStep'
import LogoStep from './form-steps/LogoStep'

interface RestaurantFormProps {
    mode: RestaurantFormMode
    initialData?: Partial<RestaurantFormData>
    onSubmit: (data: RestaurantFormData) => Promise<void>
}

export const BaseRestaurantForm: React.FC<RestaurantFormProps> = ({
    mode,
    initialData,
    onSubmit
}) => {
    const {
        methods,
        currentStep,
        isSubmitting,
        logoFile,
        logoPreview,
        formError,
        nextStep,
        prevStep,
        handleLogoChange,
        handleSubmit
    } = useRestaurantForm(mode, initialData as any, onSubmit) // Pass onSubmit to the hook

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <BasicInfoStep />
            case 1:
                return <LocationStep />
            case 2:
                return <HoursStep />
            case 3:
                return <LogoStep onLogoChange={handleLogoChange} existingLogoUrl={logoPreview} />
            default:
                return null
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">
                {mode === 'create' ? 'Create New Restaurant' : 'Edit Restaurant'}
            </h1>

            <FormProvider {...methods}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        // Only submit if we're on the final step
                        if (currentStep === RESTAURANT_FORM_STEPS.length - 1) {
                            methods.handleSubmit(handleSubmit)(e)
                        }
                    }}
                    className="space-y-8"
                >
                    <FormStepper
                        steps={[...RESTAURANT_FORM_STEPS]}
                        currentStep={currentStep}
                    />

                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {formError}
                        </div>
                    )}

                    <div className="bg-white shadow rounded-lg p-6">
                        {renderStep()}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {currentStep < RESTAURANT_FORM_STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    nextStep()
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Restaurant' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    )
} 