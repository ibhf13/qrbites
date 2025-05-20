import React from 'react'
import { Typography, FlexBox, Box, Pagination } from '@/components/common'
import { Menu } from '../types/menu.types'
import { MenuCard } from './MenuCard'
import { MenuListSkeleton } from './MenuListSkeleton'

interface MenuListProps {
    menus: Menu[]
    isLoading: boolean
    error: string | null
    totalCount: number
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    onEdit: (menuId: string) => void
    onDelete: (menuId: string) => void
    onGenerateQR: (menuId: string) => void
    onViewQR: (menuId: string) => void
    onView: (menuId: string) => void
}

export const MenuList: React.FC<MenuListProps> = ({
    menus,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    onGenerateQR,
    onViewQR,
    onView,
}) => {
    if (isLoading) {
        return <MenuListSkeleton count={6} />
    }

    if (error) {
        return (
            <Box className="text-center py-12">
                <Typography as="h3" variant="heading" color="muted" className="mb-4">
                    Error loading menus
                </Typography>
                <Typography as="p" variant="body" color="muted" className="mb-6">
                    {error}
                </Typography>
            </Box>
        )
    }

    if (menus.length === 0) {
        return (
            <Box className="text-center py-12">
                <Typography as="h3" variant="heading" color="muted" className="mb-4">
                    No menus found
                </Typography>
                <Typography as="p" variant="body" color="muted" className="mb-6">
                    Get started by creating your first menu
                </Typography>
            </Box>
        )
    }

    return (
        <>
            <FlexBox justify="between" align="center" className="mb-6">
                <FlexBox direction="col" grow={true}>
                    <Typography as="p" variant="body" color="muted">
                        Showing {menus.length} of {totalCount} menus
                    </Typography>
                </FlexBox>
            </FlexBox>

            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
            </Box>

            {totalPages > 1 && (
                <FlexBox justify="between" align="center" className="mt-6">
                    <FlexBox direction="col" grow={true}>
                        <Typography as="p" variant="body" color="muted">
                            Page {currentPage} of {totalPages} ({totalCount} total items)
                        </Typography>
                    </FlexBox>
                    <FlexBox direction="col" grow={true}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </FlexBox>
                </FlexBox>
            )}
        </>
    )
}

export default MenuList 