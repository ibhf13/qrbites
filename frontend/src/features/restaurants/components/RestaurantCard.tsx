import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Box, FlexBox } from '@/components/common'
import { Restaurant } from '../types/restaurant.types'
import {
    PencilIcon,
    TrashIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'

interface RestaurantCardProps {
    restaurant: Restaurant
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    loading?: boolean
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
    restaurant,
    onEdit,
    onDelete,
    loading = false
}) => {
    const navigate = useNavigate()
    const { _id, name, description, logoUrl, isActive, location } = restaurant

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onEdit(_id)
    }

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onDelete(_id)
    }

    const handleViewMenus = () => {
        if (!loading) {
            navigate(`/restaurants/${_id}`)
        }
    }


    const getLocationText = () => {
        if (!location) return 'No address provided'

        const { street, houseNumber, city, zipCode } = location
        const parts = [
            street && houseNumber ? `${street} ${houseNumber}` : street || houseNumber,
            city,
            zipCode
        ].filter(Boolean)

        return parts.length > 0 ? parts.join(', ') : 'No address provided'
    }

    return (
        <Card
            variant="default"
            hoverEffect="lift"
            interactive
            loading={loading}
            onClick={handleViewMenus}
            image={{
                src: logoUrl,
                alt: `${name} logo`,
                aspectRatio: 'video',
                placeholder: logoUrl || name,
                objectFit: 'cover',
                className: 'h-36'
            }}

            badges={[
                {
                    label: isActive ? 'Active' : 'Inactive',
                    color: isActive ? 'success' : 'warning',
                    variant: 'filled',
                    position: 'top-left'
                }
            ]}
            actions={[
                {
                    icon: PencilIcon,
                    label: 'Edit restaurant',
                    onClick: handleEdit,
                    variant: 'primary'
                },
                {
                    icon: TrashIcon,
                    label: 'Delete restaurant',
                    onClick: handleDelete,
                    variant: 'danger'
                }
            ]}
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
                    <MapPinIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                    <Typography
                        variant="caption"
                        className="text-slate-500 dark:text-slate-400 line-clamp-2 text-xs"
                    >
                        {getLocationText()}
                    </Typography>
                </FlexBox>
            </Box>
        </Card>
    )
}

export default RestaurantCard