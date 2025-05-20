import React from 'react'
import { formatDate } from '@/utils/date'
import { Card, Typography, Box } from '@/components/common'
import { DropdownMenu } from '@/components/common/navigation'
import type { DropdownMenuItem } from '@/components/common/navigation/DropdownMenu'
import {
    QrCodeIcon,
    PencilIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    EllipsisVerticalIcon,
    CalendarIcon,
    PhotoIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Menu } from '../types/menu.types'

interface MenuCardProps {
    menu: Menu
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onGenerateQR: (id: string) => void
    onViewQR?: (id: string) => void
    onView?: (id: string) => void
    loading?: boolean
}

export const MenuCard: React.FC<MenuCardProps> = ({
    menu,
    onEdit,
    onDelete,
    onGenerateQR,
    onViewQR,
    onView,
    loading = false
}) => {
    const { _id, name, description, imageUrl, qrCodeUrl, updatedAt, isActive } = menu

    const handleEdit = () => onEdit(_id)
    const handleDelete = () => onDelete(_id)
    const handleGenerateQR = () => onGenerateQR(_id)
    const handleViewQR = () => onViewQR?.(_id)
    const handleView = () => onView?.(_id)

    const imagePlaceholder = (
        <Box className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <Box className="text-center space-y-2">
                <Box className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <PhotoIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </Box>
                <Typography variant="caption" color="muted" className="text-xs">
                    No image
                </Typography>
            </Box>
        </Box>
    )

    const imageFallback = (
        <Box className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <Box className="text-center space-y-1.5">
                <Box className="w-8 h-8 bg-red-200 dark:bg-red-800 rounded-lg flex items-center justify-center mx-auto">
                    <PhotoIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                </Box>
                <Typography variant="caption" color="muted" className="text-xs">
                    Failed to load
                </Typography>
            </Box>
        </Box>
    )

    const dropdownItems: DropdownMenuItem[] = [
        {
            id: 'view',
            label: 'View Menu',
            icon: ArrowTopRightOnSquareIcon,
            onClick: handleView,
            variant: 'primary'
        },
        {
            id: 'qr',
            label: qrCodeUrl ? 'View QR Code' : 'Generate QR Code',
            icon: QrCodeIcon,
            onClick: qrCodeUrl ? handleViewQR : handleGenerateQR,
            variant: 'default'
        },
        {
            id: 'edit',
            label: 'Edit Menu',
            icon: PencilIcon,
            onClick: handleEdit,
            variant: 'default'
        },
        {
            id: 'delete',
            label: 'Delete Menu',
            icon: TrashIcon,
            onClick: handleDelete,
            variant: 'danger',
            divider: true
        }
    ]

    return (
        <Card
            variant="default"
            hoverEffect="scale"
            hoverScale={1.02}
            loading={loading}
            data-qa="menu-card"
            aria-label={`Menu card for ${name}`}
            image={{
                src: imageUrl,
                alt: `${name} menu`,
                aspectRatio: 'video',
                placeholder: !imageUrl ? imagePlaceholder : undefined,
                fallback: imageFallback,
                objectFit: 'cover'
            }}
            badges={[
                ...(isActive !== undefined ? [{
                    label: isActive ? 'Active' : 'Inactive',
                    color: (isActive ? 'success' : 'warning'),
                    variant: 'filled' as const,
                    position: 'top-left' as const
                }] : []),

            ]}
            contentPadding="sm"
            className="relative h-full"
        >
            {!loading && (
                <Box className="absolute top-2 right-2 z-30">
                    <DropdownMenu
                        trigger={
                            <Box className="p-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                <EllipsisVerticalIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                            </Box>
                        }
                        items={dropdownItems}
                        placement="bottom-right"
                        size="md"
                    />
                </Box>
            )}

            <Box className="space-y-2.5">
                <Box className="space-y-1.5">
                    <Typography
                        variant="subheading"
                        color="neutral"
                        className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 text-base"
                    >
                        {name}
                    </Typography>
                    <Box className="min-h-[2.25rem] flex items-start">
                        <Typography
                            variant="body"
                            color="muted"
                            className={`line-clamp-2 text-sm leading-tight ${description
                                ? "text-gray-600 dark:text-gray-400"
                                : "text-gray-400 dark:text-gray-500 italic"
                                }`}
                        >
                            {description || 'No description provided'}
                        </Typography>
                    </Box>
                </Box>

                <Box className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Box className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <Typography variant="caption" color="muted" className="text-xs">
                            {formatDate(updatedAt)}
                        </Typography>
                    </Box>

                    {qrCodeUrl && (
                        <Box className="flex items-center space-x-1 cursor-pointer" onClick={handleViewQR}>
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                            <Typography variant="caption" className="text-green-600 dark:text-green-400 font-medium text-xs">
                                QR Ready
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Card>
    )
}

export default MenuCard