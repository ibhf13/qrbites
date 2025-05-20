import React, { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Card, Button, ErrorDisplay, Box, ErrorBoundary, FlexBox, ConfirmationDialog } from '@/components/common'
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
            <Box className="w-full max-w-none">
                <FormProvider {...methods}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (currentStep === RESTAURANT_FORM_STEPS.length - 1) {
                                methods.handleSubmit(handleSubmit)(e)
                            }
                        }}
                        className="space-y-2"
                    >
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

                        <Card variant="elevated" padding="xl" className="min-h-[500px]">
                            <Box className="w-full">
                                {renderStep()}
                            </Box>
                        </Card>

                        <FlexBox justify="between" align="center" className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                            <FlexBox gap="md">
                                <Button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    variant="secondary"
                                    size="lg"
                                >
                                    Previous
                                </Button>

                                {onCancel && (
                                    <Button
                                        type="button"
                                        onClick={handleCancelClick}
                                        variant="ghost"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </FlexBox>

                            <FlexBox gap="md">
                                {currentStep < RESTAURANT_FORM_STEPS.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            await nextStep()
                                        }}
                                        variant="primary"
                                        size="lg"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        isLoading={isSubmitting}
                                        variant="primary"
                                        size="lg"
                                    >
                                        {mode === 'create' ? 'Create Restaurant' : 'Save Changes'}
                                    </Button>
                                )}
                            </FlexBox>
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
            </Box>
        </ErrorBoundary>
    )
}

export default BaseRestaurantForm