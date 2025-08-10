import { StepState } from '../types'

export type { StepState }

export interface StepStyleConfig {
    baseClasses: string
    stateClasses: {
        completed: string
        active: string
        inactive: string
    }
    hoverClasses: {
        completed: string
        active: string
        inactive: string
    }
}

export const getStepState = (stepIndex: number, currentStep: number): StepState => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'

    return 'inactive'
}

export const isStepClickable = (
    stepIndex: number,
    currentStep: number,
    onStepClick?: (stepIndex: number) => void
): boolean => {
    return Boolean(onStepClick && (stepIndex <= currentStep || stepIndex === currentStep + 1))
}

export const getProgressPercentage = (currentStep: number, totalSteps: number): number => {
    return Math.round((currentStep / (totalSteps - 1)) * 100)
}

export const getCurrentPageIndex = (currentStep: number, itemsPerPage: number = 2): number => {
    return Math.floor(currentStep / itemsPerPage)
}

export const getTotalPages = (totalSteps: number, itemsPerPage: number = 2): number => {
    return Math.ceil(totalSteps / itemsPerPage)
}