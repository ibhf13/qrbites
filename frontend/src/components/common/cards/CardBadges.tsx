import React from 'react'
import { cn } from '@/utils/cn'
import { Box } from '../layout'
import { Badge } from '../feedback'
import { BadgeColor } from '../feedback/Badge'
import { CardBadge } from './Card.types'

interface CardBadgesProps {
    badges: CardBadge[]
    loading?: boolean
}

export const CardBadges: React.FC<CardBadgesProps> = ({
    badges,
    loading = false
}) => {
    if (!badges?.length || loading) return null

    return (
        <>
            {badges.map((badge, index) => (
                <Box
                    key={index}
                    className={cn(
                        'absolute z-20',
                        badge.position === 'top-right' ? 'top-2 right-1' :
                            badge.position === 'bottom-left' ? 'bottom-2 left-1' :
                                badge.position === 'bottom-right' ? 'bottom-2 right-1' :
                                    'top-2 left-1'
                    )}
                >
                    <Badge
                        label={badge.label}
                        color={badge.color as BadgeColor}
                        variant={badge.variant}
                        size="sm"
                        className="shadow-sm"
                    />
                </Box>
            ))}
        </>
    )
}

export default CardBadges