import React from 'react'
import { LoadingSpinner, ErrorDisplay } from '@/components/common/feedback'
import { Typography, FlexBox, Box, Grid } from '@/components/common'
import { MenuCard } from './MenuCard'
import { MenuListSkeleton } from './MenuListSkeleton'
import { Menu } from '../types/menu.types'

interface MenuListContainerProps {
    menus: Menu[]
    isLoading: boolean
    error?: string | null
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onGenerateQR: (id: string) => void
    onViewQR: (id: string) => void
    onView?: (id: string) => void
}

export const MenuListContainer: React.FC<MenuListContainerProps> = ({
    menus,
    isLoading,
    error,
    onEdit,
    onDelete,
    onGenerateQR,
    onViewQR,
    onView,
}) => {
    if (isLoading) {
        return (
            <Box className="space-y-4 -mx-2 sm:-mx-4 md:-mx-6">
                <MenuListSkeleton count={6} />
            </Box>
        )
    }

    if (error) {
        return (
            <Box className="px-2 sm:px-4 md:px-6">
                <ErrorDisplay
                    message={`Failed to load menus: ${error}`}
                    className="py-8"
                    variant="banner"
                />
            </Box>
        )
    }

    if (menus.length === 0) {
        return (
            <Box className="px-2 sm:px-4 md:px-6">
                <Box className="text-center py-8">
                    <Box className="max-w-md mx-auto">
                        <Box className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </Box>
                        <Typography variant="heading" color="neutral" className="mb-2 text-lg">
                            No menus found
                        </Typography>
                        <Typography variant="body" color="muted" className="text-sm">
                            Create your first menu to get started
                        </Typography>
                    </Box>
                </Box>
            </Box>
        )
    }

    return (
        <Box className="space-y-4 -mx-2 sm:-mx-4 md:-mx-6">
            <FlexBox
                justify="between"
                align="center"
                className="px-2 sm:px-4 md:px-6"
            >
                <Typography
                    as="p"
                    variant="body"
                    color="neutral"
                    className="text-sm sm:text-base"
                >
                    <span className="hidden sm:inline">
                        {menus.length} menu{menus.length !== 1 ? 's' : ''} found
                    </span>
                    <span className="sm:hidden">
                        {menus.length} menu{menus.length !== 1 ? 's' : ''}
                    </span>
                </Typography>
            </FlexBox>

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
                    {menus.map((menu) => (
                        <MenuCard
                            key={menu._id}
                            menu={menu}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onGenerateQR={onGenerateQR}
                            onViewQR={onViewQR}
                            onView={onView}
                        />
                    ))}
                </Grid>
            </Box>
        </Box>
    )
}

export default MenuListContainer 