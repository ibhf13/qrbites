import React from 'react'
import { formatDate } from '@/utils/date'
import { Card, Typography, Box, FlexBox } from '@/components/common'
import {
    QrCodeIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Menu } from '../types/menu.types'

interface MenuCardProps {
    menu: Menu
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onGenerateQR: (id: string) => void
    onRegenerateQR?: (id: string) => void
    onViewQR?: (id: string) => void
    onView?: (id: string) => void
    loading?: boolean
}

export const MenuCard: React.FC<MenuCardProps> = ({
    menu,
    onEdit,
    onDelete,
    onGenerateQR,
    onRegenerateQR,
    onViewQR,
    onView,
    loading = false
}) => {
    const { _id, name, description, imageUrl, qrCodeUrl, updatedAt, isActive } = menu

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onEdit(_id)
    }

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onDelete(_id)
    }

    const handleQRAction = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (qrCodeUrl && onViewQR) {
            onViewQR(_id)
        } else {
            onGenerateQR(_id)
        }
    }

    const handleRegenerateQR = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (onRegenerateQR) {
            onRegenerateQR(_id)
        }
    }

    const handleViewMenu = () => {
        if (!loading && onView) {
            onView(_id)
        }
    }

    return (
        <Card
            variant="default"
            hoverEffect="lift"
            interactive
            loading={loading}
            onClick={handleViewMenu}
            image={{
                src: imageUrl,
                alt: `${name} menu`,
                aspectRatio: 'video',
                placeholder: imageUrl || name,
                objectFit: 'cover',
                className: 'h-36'
            }}
            badges={[
                ...(isActive !== undefined ? [{
                    label: isActive ? 'Active' : 'Inactive',
                    color: isActive ? 'success' : 'warning',
                    variant: 'filled' as const,
                    position: 'top-left' as const
                }] : [])
            ]}
            actions={[
                {
                    icon: QrCodeIcon,
                    label: qrCodeUrl ? 'View QR Code' : 'Generate QR Code',
                    onClick: handleQRAction,
                    variant: 'primary'
                },
                ...(qrCodeUrl && onRegenerateQR ? [{
                    icon: ArrowPathIcon,
                    label: 'Regenerate QR Code',
                    onClick: handleRegenerateQR,
                    variant: 'primary' as const
                }] : []),
                {
                    icon: PencilIcon,
                    label: 'Edit menu',
                    onClick: handleEdit,
                    variant: 'primary'
                },
                {
                    icon: TrashIcon,
                    label: 'Delete menu',
                    onClick: handleDelete,
                    variant: 'danger'
                }
            ]}
            actionDirection="col"
            contentPadding="sm"
            className="h-full flex flex-col"
        >
            <Box className="flex-1 space-y-2.5">
                <Typography
                    variant="heading"
                    color="neutral"
                    className="font-semibold line-clamp-1 text-base"
                >
                    {name}
                </Typography>

                <Typography
                    variant="body"
                    color="muted"
                    className={`text-sm line-clamp-2 min-h-[2.25rem] ${description
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-400 dark:text-slate-500 italic"
                        }`}
                >
                    {description || 'No description provided'}
                </Typography>

                <FlexBox className="gap-2 bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1.5 mt-auto">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                    <Typography
                        variant="caption"
                        className="text-slate-500 dark:text-slate-400 text-xs"
                    >
                        {formatDate(updatedAt)}
                    </Typography>

                    {qrCodeUrl && (
                        <FlexBox className="items-center space-x-1 ml-auto" onClick={(e) => {
                            e.stopPropagation()
                            if (qrCodeUrl && onViewQR) {
                                onViewQR(_id)
                            } else {
                                onGenerateQR(_id)
                            }
                        }}>
                            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                            <Typography variant="caption" className="text-green-600 dark:text-green-400 font-medium text-xs">
                                QR Ready
                            </Typography>
                        </FlexBox>
                    )}
                </FlexBox>
            </Box >
        </Card >
    )
}

export default MenuCard