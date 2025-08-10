import React from 'react'
import { Box } from '@/components/common'
import { CONNECTOR_STYLES } from '../constants/stepStyles'

interface StepConnectorProps {
    stepIndex: number
    currentStep: number
    isMobile?: boolean
    style?: React.CSSProperties
}

const getConnectorState = (stepIndex: number, currentStep: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep - 1) return 'active'

    return 'inactive'
}

const getConnectorClasses = (state: string, isMobile: boolean = false): string => {
    const baseClass = isMobile
        ? CONNECTOR_STYLES.base.replace('flex-1 mx-3', 'w-full')
        : CONNECTOR_STYLES.base

    const stateClass = CONNECTOR_STYLES[state as keyof typeof CONNECTOR_STYLES] || CONNECTOR_STYLES.inactive

    return `${baseClass} ${stateClass}`.trim()
}

const StepConnector: React.FC<StepConnectorProps> = ({
    stepIndex,
    currentStep,
    isMobile = false,
    style
}) => {
    const state = getConnectorState(stepIndex, currentStep)

    return (
        <Box
            className={getConnectorClasses(state, isMobile)}
            style={style}
        />
    )
}

export default StepConnector