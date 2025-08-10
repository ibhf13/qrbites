import React from 'react'
import { Card } from '@/components/common'
import { DesktopStepper, MobileStepper, ProgressBar } from './components'
import { Step } from './types'

interface FormStepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepIndex: number) => void
}

const FormStepper: React.FC<FormStepperProps> = ({ steps, currentStep, onStepClick }) => {
    return (
        <Card variant="outlined" padding="sm" className="bg-white dark:bg-neutral-900">
            <DesktopStepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={onStepClick}
            />

            <MobileStepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={onStepClick}
            />

            <ProgressBar
                currentStep={currentStep}
                totalSteps={steps.length}
            />
        </Card>
    )
}

export default FormStepper 