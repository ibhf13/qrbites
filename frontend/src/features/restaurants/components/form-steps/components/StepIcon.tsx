import React from 'react'
import { StepState } from '../utils/stepUtils'

interface StepIconProps {
    stepIndex: number
    state: StepState
}

const CheckIcon: React.FC = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 13l4 4L19 7"
        />
    </svg>
)

const StepNumber: React.FC<{ number: number }> = ({ number }) => (
    <span className="font-bold text-lg leading-none select-none flex items-center justify-center">
        {number}
    </span>
)

const StepIcon: React.FC<StepIconProps> = ({ stepIndex, state }) => {
    if (state === 'completed') {
        return <CheckIcon />
    }

    return <StepNumber number={stepIndex + 1} />
}

export default StepIcon