import React from 'react'
import { Card, Skeleton, Box, FlexBox, Grid } from '@/components/common'

interface MenuListSkeletonProps {
    count?: number
}

const MenuCardSkeleton: React.FC = () => {
    return (
        <Card
            variant="default"
            padding="none"
            className="overflow-hidden h-full flex flex-col"
        >
            <Skeleton variant="rectangular" className="w-full h-36" />

            <Box className="flex-1 p-3 space-y-2.5 flex flex-col">
                <Box className="space-y-1.5">
                    <Skeleton className="h-5 w-4/5 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                </Box>

                <Box className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <FlexBox justify="between" align="center">
                        <FlexBox align="center" gap="xs">
                            <Skeleton className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
                        </FlexBox>
                        <Skeleton className="h-3 w-14 bg-gray-200 dark:bg-gray-700" />
                    </FlexBox>
                </Box>
            </Box>
        </Card>
    )
}

export const MenuListSkeleton: React.FC<MenuListSkeletonProps> = ({ count = 6 }) => {
    return (
        <Box className="px-2 sm:px-4 md:px-6">
            <Grid
                cols={1}
                colsSm={2}
                colsMd={3}
                colsLg={4}
                colsXl={4}
                gap="sm"
                responsive={true}
                className="sm:gap-4"
            >
                {Array.from({ length: count }, (_, index) => (
                    <MenuCardSkeleton key={index} />
                ))}
            </Grid>
        </Box>
    )
}

export default MenuListSkeleton 