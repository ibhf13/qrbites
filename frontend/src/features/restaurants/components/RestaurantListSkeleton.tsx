import React from 'react'
import { Card, Skeleton, Box, FlexBox } from '@/components/common'

interface RestaurantListSkeletonProps {
    count?: number
    gridLayout?: boolean
}

const RestaurantListSkeleton: React.FC<RestaurantListSkeletonProps> = ({
    count = 6,
    gridLayout = true
}) => {
    const skeletons = Array.from({ length: count }).map((_, index) => (
        <Card
            key={`skeleton-${index}`}
            variant="elevated"
            padding="none"
            className="overflow-hidden h-full flex flex-col"
        >
            <Skeleton variant="rectangular" className="w-full h-36" />

            <Box className="flex-1 p-3 space-y-2.5 flex flex-col">
                <Box className="space-y-2">
                    <Skeleton variant="text" width="80%" height="20px" />
                    <Box className="space-y-1">
                        <Skeleton variant="text" width="100%" height="14px" />
                        <Skeleton variant="text" width="75%" height="14px" />
                    </Box>
                </Box>

                <Box className="bg-gray-100 dark:bg-gray-800 rounded-md p-2 mt-auto">
                    <FlexBox align="start" gap="sm">
                        <Skeleton variant="circular" width="14px" height="14px" className="flex-shrink-0 mt-0.5" />
                        <Box className="flex-1 space-y-1">
                            <Skeleton variant="text" width="85%" height="12px" />
                            <Skeleton variant="text" width="65%" height="12px" />
                        </Box>
                    </FlexBox>
                </Box>

                <Box className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <FlexBox justify="between" align="center">
                        <Skeleton variant="rounded" width="50px" height="18px" />
                        <FlexBox gap="xs">
                            <Skeleton variant="circular" width="28px" height="28px" />
                            <Skeleton variant="circular" width="28px" height="28px" />
                        </FlexBox>
                    </FlexBox>
                </Box>
            </Box>
        </Card>
    ))

    if (gridLayout) {
        return (
            <Box className="px-2 sm:px-4 md:px-6">
                <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {skeletons}
                </Box>
            </Box>
        )
    }

    return (
        <Box className="space-y-4 px-2 sm:px-4 md:px-6">
            {skeletons}
        </Box>
    )
}

export default RestaurantListSkeleton