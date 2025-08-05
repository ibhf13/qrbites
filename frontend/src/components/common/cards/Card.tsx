import React from 'react'
import { cn } from '@/utils/cn'
import { getCardVariantClasses, animations } from '@/utils/designTokenUtils'
import { Box } from '../layout'
import { CardImage } from './CardImage'
import { CardActions } from './CardActions'
import { CardBadges } from './CardBadges'
import { CardHeader } from './CardHeader'
import { CardFooter } from './CardFooter'
import { CardContent } from './CardContent'
import {
    CardProps,
    CardVariant,
    CardSize,
    ImageAspectRatio,
    ActionItem,
    sizeClasses,
    hoverEffectClasses,
    HoverEffect
} from './Card.types'

export type { CardVariant, CardSize, ImageAspectRatio, ActionItem }

export const Card: React.FC<CardProps> = ({
    children,
    className,
    variant = 'default',
    size,
    padding = 'md',
    title,
    subtitle,
    footer,
    headerAction,
    interactive = false,
    loading = false,
    image,
    actions,
    showActionsOnHover = true,
    actionPosition = 'top-right',
    badges,
    hoverEffect = 'none',
    hoverScale,
    contentPadding,
    actionDirection,
    'aria-label': ariaLabel,
    role,
    ...rest
}) => {
    const hasHeader = title || subtitle || headerAction
    const hasImage = Boolean(image?.src || image?.placeholder)
    const hasActions = actions && actions.length > 0
    const hasBadges = badges && badges.length > 0
    const effectivePadding = contentPadding || padding

    const getHoverClasses = () => {
        if (!hoverEffect || hoverEffect === 'custom') return ''
        if (hoverEffect === 'scale' && hoverScale) {
            return `hover:scale-[${hoverScale}]`
        }

        return hoverEffectClasses[hoverEffect as HoverEffect] || ''
    }

    const cardClasses = cn(
        'relative rounded-xl overflow-hidden group',
        animations.smooth,
        {
            'cursor-pointer': interactive,
            'pointer-events-none opacity-60': loading
        },
        getCardVariantClasses(variant),
        size && sizeClasses[size].maxWidth,
        getHoverClasses(),
        className
    )

    const ImageSection = () => {
        if (!image) return null

        return (
            <Box className="relative overflow-hidden">
                <CardImage image={image} />
                {hasBadges && badges && <CardBadges badges={badges} loading={loading} />}
                {hasActions && actions && (
                    <CardActions
                        actions={actions}
                        showActionsOnHover={showActionsOnHover}
                        actionPosition={actionPosition}
                        loading={loading}
                        actionDirection={actionDirection}
                    />
                )}
            </Box>
        )
    }

    if (hasHeader || footer) {
        return (
            <Box
                className={cardClasses}
                aria-label={ariaLabel}
                role={role}
                {...rest}
            >
                <CardHeader
                    title={title}
                    subtitle={subtitle}
                    headerAction={headerAction}
                    loading={loading}
                />
                {hasImage && <ImageSection />}
                <CardContent
                    padding={effectivePadding}
                    loading={loading}
                >
                    {children}
                </CardContent>
                <CardFooter footer={footer} loading={loading} />
            </Box>
        )
    }

    if (hasImage) {
        return (
            <Box
                className={cardClasses}
                aria-label={ariaLabel}
                role={role}
                {...rest}
            >
                <ImageSection />
                <CardContent
                    padding={effectivePadding}
                    loading={loading}
                >
                    {children}
                </CardContent>
            </Box>
        )
    }

    return (
        <Box
            className={cardClasses}
            aria-label={ariaLabel}
            role={role}
            {...rest}
        >
            <CardContent
                padding={effectivePadding}
                loading={loading}
            >
                {children}
            </CardContent>
        </Box>
    )
}

export default Card