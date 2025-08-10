import React from 'react'
import { Box, FlexBox } from '@/components/common'
import { getCurrentPageIndex, getTotalPages } from '../utils/stepUtils'
import { MOBILE_STYLES } from '../constants/stepStyles'

interface PageIndicatorProps {
    currentStep: number
    totalSteps: number
    itemsPerPage?: number
}

const PageIndicator: React.FC<PageIndicatorProps> = ({
    currentStep,
    totalSteps,
    itemsPerPage = 2
}) => {
    const totalPageCount = getTotalPages(totalSteps, itemsPerPage)
    const currentPageIndex = getCurrentPageIndex(currentStep, itemsPerPage)

    if (totalPageCount <= 1) return null

    return (
        <FlexBox justify="center" className="mt-3 space-x-1">
            {Array.from({ length: totalPageCount }).map((_, pageIndex) => {
                const isActive = currentPageIndex === pageIndex
                const indicatorClass = isActive
                    ? MOBILE_STYLES.pageIndicator.active
                    : MOBILE_STYLES.pageIndicator.inactive

                return (
                    <Box
                        key={pageIndex}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${indicatorClass}`}
                    />
                )
            })}
        </FlexBox>
    )
}

export default PageIndicator