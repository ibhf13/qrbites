import React from 'react'
import { Box, FlexBox } from '@/components/common'
import { getProgressPercentage } from '../utils/stepUtils'
import { PROGRESS_BAR_STYLES } from '../constants/stepStyles'

interface ProgressBarProps {
    currentStep: number
    totalSteps: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const percentage = getProgressPercentage(currentStep, totalSteps)

    return (
        <Box className="px-2 py-3">
            <FlexBox justify="between" className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <span>Progress</span>
                <span>{percentage}%</span>
            </FlexBox>
            <Box className={PROGRESS_BAR_STYLES.container}>
                <Box
                    className={PROGRESS_BAR_STYLES.bar}
                    style={{ width: `${percentage}%` }}
                />
            </Box>
        </Box>
    )
}

export default ProgressBar