import React, { useRef, useEffect } from 'react'
import { Box, FlexBox } from '@/components/common'
import { getStepState } from '../utils/stepUtils'
import { MOBILE_STYLES } from '../constants/stepStyles'
import { Step } from '../types'
import StepButton from './StepButton'
import StepConnector from './StepConnector'
import PageIndicator from './PageIndicator'

interface MobileStepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepIndex: number) => void
}

const MobileStepper: React.FC<MobileStepperProps> = ({
    steps,
    currentStep,
    onStepClick
}) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current
            const stepWidth = container.scrollWidth / steps.length
            const targetScroll = Math.max(0, (currentStep - 0.5) * stepWidth)

            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            })
        }
    }, [currentStep, steps.length])

    return (
        <Box className="md:hidden">
            <Box className="relative">
                <Box ref={scrollRef} className={MOBILE_STYLES.container}>
                    {steps.map((step, index) => {
                        const state = getStepState(index, currentStep)

                        return (
                            <Box key={step.id} className={MOBILE_STYLES.stepWrapper}>
                                <FlexBox direction="col" align="center" className="relative">
                                    <StepButton
                                        step={step}
                                        stepIndex={index}
                                        currentStep={currentStep}
                                        state={state}
                                        onStepClick={onStepClick}
                                    />

                                    {index < steps.length - 1 && (
                                        <StepConnector
                                            stepIndex={index}
                                            currentStep={currentStep}
                                            isMobile
                                            style={{
                                                transform: 'translateX(25%)',
                                                width: '75%',
                                                zIndex: -1
                                            }}
                                        />
                                    )}
                                </FlexBox>
                            </Box>
                        )
                    })}
                </Box>

                <PageIndicator currentStep={currentStep} totalSteps={steps.length} />
            </Box>
        </Box>
    )
}

export default MobileStepper