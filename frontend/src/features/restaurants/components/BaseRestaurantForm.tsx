import React, { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Button, ErrorDisplay, ErrorBoundary, FlexBox, ConfirmationDialog } from '@/components/common'
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
    onCancel?: () => void
}

const BaseRestaurantForm: React.FC<RestaurantFormProps> = ({
    mode,
    initialData,
    onSubmit,
    onCancel
}) => {
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showStepChangeDialog, setShowStepChangeDialog] = useState(false)
    const [pendingStepChange, setPendingStepChange] = useState<number | null>(null)

    const existingLogoUrl = initialData?.logoUrl

    const {
        methods,
        currentStep,
        isSubmitting,
        logoPreview,
        formError,
        nextStep,
        prevStep,
        goToStep,
        handleLogoChange,
        handleSubmit
    } = useRestaurantForm(mode, initialData, onSubmit, existingLogoUrl)

    const { formState: { isDirty } } = methods

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

    const handleCancelClick = () => {
        if (isDirty) {
            setShowCancelDialog(true)
        } else {
            onCancel?.()
        }
    }

    const handleConfirmCancel = () => {
        setShowCancelDialog(false)
        onCancel?.()
    }

    const handleStepClick = (stepIndex: number) => {
        if (isDirty && stepIndex !== currentStep) {
            setPendingStepChange(stepIndex)
            setShowStepChangeDialog(true)
        } else {
            goToStep(stepIndex)
        }
    }

    const handleConfirmStepChange = () => {
        if (pendingStepChange !== null) {
            goToStep(pendingStepChange)
            setPendingStepChange(null)
        }

        setShowStepChangeDialog(false)
    }

    const handleCancelStepChange = () => {
        setPendingStepChange(null)
        setShowStepChangeDialog(false)
    }

    return (
        <ErrorBoundary>
            <FormProvider {...methods}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (currentStep === RESTAURANT_FORM_STEPS.length - 1) {
                            methods.handleSubmit(handleSubmit)(e)
                        }
                    }}
                    className="space-y-4"
                >
                    <FlexBox direction="col" gap="md" className="pt-2">

                        <FormStepper
                            steps={[...RESTAURANT_FORM_STEPS]}
                            currentStep={currentStep}
                            onStepClick={handleStepClick}
                        />

                        {formError && (
                            <ErrorDisplay
                                variant="banner"
                                message={formError}
                                title="Form Error"
                            />
                        )}

                        {renderStep()}
                    </FlexBox>
                    <FlexBox
                        gap="sm"
                        className="order-2 flex flex-col sm:flex-row sm:justify-end sm:items-center w-full"
                    >
                        <Button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            variant="info"
                            size="md"
                            className="flex-1 sm:flex-none"
                        >
                            Previous
                        </Button>

                        {currentStep < RESTAURANT_FORM_STEPS.length - 1 ? (
                            <Button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault()
                                    await nextStep()
                                }}
                                variant="primary"
                                size="md"
                                className="flex-1 sm:flex-none"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                                variant="primary"
                                size="md"
                                className="flex-1 sm:flex-none"
                            >
                                {mode === 'create' ? 'Create Restaurant' : 'Save Changes'}
                            </Button>
                        )}

                        {onCancel && (
                            <Button
                                type="button"
                                onClick={handleCancelClick}
                                variant="warning"
                                size="md"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                        )}
                    </FlexBox>

                </form>
            </FormProvider>

            <ConfirmationDialog
                isOpen={showCancelDialog}
                title="Cancel Form"
                message="You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
                type="warning"
                confirmText="Yes, Cancel"
                cancelText="Keep Editing"
                onConfirm={handleConfirmCancel}
                onCancel={() => setShowCancelDialog(false)}
                isLoading={false}
            />

            <ConfirmationDialog
                isOpen={showStepChangeDialog}
                title="Unsaved Changes"
                message="You have unsaved changes on this step. Are you sure you want to continue? Changes will be lost."
                type="warning"
                confirmText="Continue"
                cancelText="Stay Here"
                onConfirm={handleConfirmStepChange}
                onCancel={handleCancelStepChange}
                isLoading={false}
            />
        </ErrorBoundary >
    )
}

export default BaseRestaurantForm