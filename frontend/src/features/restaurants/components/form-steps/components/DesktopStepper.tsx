import React from 'react'
import { Box, FlexBox } from '@/components/common'
import { getStepState } from '../utils/stepUtils'
import { Step } from '../types'
import StepButton from './StepButton'
import StepConnector from './StepConnector'

interface DesktopStepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepIndex: number) => void
}

const DesktopStepper: React.FC<DesktopStepperProps> = ({
    steps,
    currentStep,
    onStepClick
}) => {
    return (
        <Box className="hidden md:block">
            <FlexBox align="center" justify="between">
                {steps.map((step, index) => {
                    const state = getStepState(index, currentStep)

                    return (
                        <React.Fragment key={step.id}>
                            <FlexBox direction="col" align="center">
                                <StepButton
                                    step={step}
                                    stepIndex={index}
                                    currentStep={currentStep}
                                    state={state}
                                    onStepClick={onStepClick}
                                />
                            </FlexBox>

                            {index < steps.length - 1 && (
                                <StepConnector stepIndex={index} currentStep={currentStep} />
                            )}
                        </React.Fragment>
                    )
                })}
            </FlexBox>
        </Box>
    )
}

export default DesktopStepper