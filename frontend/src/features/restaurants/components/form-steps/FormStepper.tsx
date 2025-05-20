import React from 'react'
import { Card, Typography, FlexBox, Box } from '@/components/common'

interface Step {
    id: string
    title: string
}

interface FormStepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepIndex: number) => void
}

const FormStepper: React.FC<FormStepperProps> = ({ steps, currentStep, onStepClick }) => {
    const getStepState = (index: number) => {
        if (index < currentStep) return 'completed'
        if (index === currentStep) return 'active'

        return 'inactive'
    }

    const getStepClasses = (index: number) => {
        const state = getStepState(index)
        const isClickable = onStepClick && (index <= currentStep || index === currentStep + 1)

        const baseClasses = `
            relative flex items-center justify-center w-14 h-14 rounded-full 
            border-2 transition-all duration-300 ease-in-out transform text-center
            ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        `

        switch (state) {
            case 'completed':
                return `${baseClasses} 
                    bg-gradient-to-br from-success-500 to-success-600 dark:from-success-600 dark:to-success-700
                    border-success-500 dark:border-success-600 text-white shadow-lg
                    ${isClickable ? 'hover:shadow-xl hover:from-success-600 hover:to-success-700 dark:hover:from-success-700 dark:hover:to-success-800' : ''}
                `
            case 'active':
                return `${baseClasses} 
                    bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700
                    border-primary-500 dark:border-primary-600 text-white shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/50
                    ${isClickable ? 'hover:shadow-xl hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800' : ''}
                `
            case 'inactive':
                return `${baseClasses} 
                    bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 
                    text-neutral-500 dark:text-neutral-400
                    ${isClickable ? 'hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300' : ''}
                `
            default:
                return baseClasses
        }
    }

    const getConnectorClasses = (index: number) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep - 1

        return `
            flex-1 mx-3 h-1 rounded-full transition-all duration-500 ease-in-out
            ${isCompleted
                ? 'bg-gradient-to-r from-success-400 to-success-500 dark:from-success-500 dark:to-success-600 shadow-sm'
                : isActive
                    ? 'bg-gradient-to-r from-primary-400 to-primary-500 dark:from-primary-500 dark:to-primary-600 shadow-sm'
                    : 'bg-neutral-200 dark:bg-neutral-700'
            }
        `
    }

    const getStepNumberOrIcon = (index: number) => {
        const state = getStepState(index)

        if (state === 'completed') {
            return (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            )
        }

        return (
            <span className="font-bold text-lg leading-none select-none flex items-center justify-center">
                {index + 1}
            </span>
        )
    }

    const getStepTitleClasses = (index: number) => {
        const state = getStepState(index)
        const isClickable = onStepClick && (index <= currentStep || index === currentStep + 1)

        return `
            mt-3 text-center font-medium max-w-24 leading-tight transition-all duration-200
            ${isClickable ? 'cursor-pointer' : 'cursor-default'}
            ${state === 'active' ? 'text-primary-600 dark:text-primary-400' : ''}
            ${state === 'completed' ? 'text-success-600 dark:text-success-400' : ''}
            ${state === 'inactive' ? 'text-neutral-500 dark:text-neutral-400' : ''}
            ${isClickable && state === 'inactive' ? 'hover:text-neutral-700 dark:hover:text-neutral-300' : ''}
        `
    }

    const handleStepClick = (index: number) => {
        if (onStepClick && (index <= currentStep || index === currentStep + 1)) {
            onStepClick(index)
        }
    }

    return (
        <Card variant="outlined" padding="xl" className="mb-8 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
            <Box px="md">
                <FlexBox align="center" justify="between">
                    {steps.map((step, index) => {
                        const state = getStepState(index)
                        const isClickable = onStepClick && (index <= currentStep || index === currentStep + 1)

                        return (
                            <React.Fragment key={step.id}>
                                <FlexBox direction="col" align="center">
                                    <Box
                                        className={getStepClasses(index)}
                                        onClick={() => handleStepClick(index)}
                                        role={isClickable ? "button" : undefined}
                                        tabIndex={isClickable ? 0 : undefined}
                                        onKeyDown={(e) => {
                                            if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault()
                                                handleStepClick(index)
                                            }
                                        }}
                                        aria-label={`Step ${index + 1}: ${step.title} - ${state}`}
                                    >
                                        {getStepNumberOrIcon(index)}
                                    </Box>

                                    <Box
                                        className={getStepTitleClasses(index)}
                                        onClick={() => handleStepClick(index)}
                                    >
                                        <Typography variant="caption">
                                            {step.title}
                                        </Typography>
                                    </Box>
                                </FlexBox>

                                {index < steps.length - 1 && (
                                    <Box className={getConnectorClasses(index)} />
                                )}
                            </React.Fragment>
                        )
                    })}
                </FlexBox>
            </Box>

            <Box className="mt-6 px-4">
                <FlexBox justify="between" className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
                </FlexBox>
                <Box className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <Box
                        className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default FormStepper 