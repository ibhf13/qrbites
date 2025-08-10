import React from 'react'
import { Box, Typography } from '@/components/common'
import { StepState, isStepClickable } from '../utils/stepUtils'
import { STEP_STYLE_CONFIG, TITLE_STYLES } from '../constants/stepStyles'
import { Step } from '../types'
import StepIcon from './StepIcon'

interface StepButtonProps {
    step: Step
    stepIndex: number
    currentStep: number
    state: StepState
    onStepClick?: (stepIndex: number) => void
}

const getStepClasses = (state: StepState, clickable: boolean): string => {
    const { baseClasses, stateClasses, hoverClasses } = STEP_STYLE_CONFIG

    const cursorClass = clickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
    const hoverClass = clickable ? hoverClasses[state] : ''

    return `${baseClasses} ${stateClasses[state]} ${cursorClass} ${hoverClass}`.trim()
}

const getTitleClasses = (state: StepState, clickable: boolean): string => {
    const cursorClass = clickable ? 'cursor-pointer' : 'cursor-default'
    const stateClass = TITLE_STYLES[state] || ''
    const hoverClass = clickable && state === 'inactive' ? TITLE_STYLES.inactiveHover : ''

    return `${TITLE_STYLES.base} ${cursorClass} ${stateClass} ${hoverClass}`.trim()
}

const StepButton: React.FC<StepButtonProps> = ({
    step,
    stepIndex,
    currentStep,
    state,
    onStepClick
}) => {
    const clickable = isStepClickable(stepIndex, currentStep, onStepClick)

    const handleClick = () => {
        if (clickable && onStepClick) {
            onStepClick(stepIndex)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handleClick()
        }
    }

    return (
        <>
            <Box
                className={getStepClasses(state, clickable)}
                onClick={handleClick}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={handleKeyDown}
                aria-label={`Step ${stepIndex + 1}: ${step.title} - ${state}`}
            >
                <StepIcon stepIndex={stepIndex} state={state} />
            </Box>

            <Box
                className={getTitleClasses(state, clickable)}
                onClick={handleClick}
            >
                <Typography variant="caption">
                    {step.title}
                </Typography>
            </Box>
        </>
    )
}

export default StepButton