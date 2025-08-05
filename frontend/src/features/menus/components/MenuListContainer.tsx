import React from 'react'
import { Typography, FlexBox, Box, Grid } from '@/components/common'
import { MenuCard } from './MenuCard'
import { MenuListSkeleton } from './MenuListSkeleton'
import { Menu } from '../types/menu.types'

interface MenuListContainerProps {
    menus: Menu[]
    isLoading: boolean
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onGenerateQR: (id: string) => void
    onViewQR: (id: string) => void
    onView?: (id: string) => void
}

export const MenuListContainer: React.FC<MenuListContainerProps> = ({
    menus,
    isLoading,
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
        <FlexBox direction='col' className='gap-4 px-2 md:px-4 py-2'>
            <Typography
                as="p"
                variant="body"
                color="neutral"
                className="text-sm sm:text-base pt-2 "
            >
                {menus.length} menu{menus.length !== 1 ? 's' : ''} found
            </Typography>

            <Grid
                cols={1}
                colsSm={2}
                colsMd={3}
                colsLg={3}
                colsXl={3}
                gap="sm"
                responsive={true}
                className="gap-4 "
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
        </FlexBox>
    )
}

export default MenuListContainer 