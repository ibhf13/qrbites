import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { getCardVariantClasses, getPaddingClasses, animations } from '@/utils/designTokenUtils'
import { Box, FlexBox, Typography, Badge } from '../'
import { Skeleton } from '../feedback'
import { BadgeColor } from '../feedback/Badge'

export type CardVariant = 'default' | 'soft' | 'warm' | 'fresh' | 'earth' | 'elevated' | 'outlined' | 'glass'
export type CardSize = 'sm' | 'md' | 'lg'
export type ImageAspectRatio = 'square' | 'video' | 'wide' | 'tall' | 'auto'

export interface ActionItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    variant?: 'primary' | 'secondary' | 'danger'
    color?: string
    disabled?: boolean
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    variant?: CardVariant
    size?: CardSize
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    title?: string
    subtitle?: string
    footer?: React.ReactNode
    headerAction?: React.ReactNode
    interactive?: boolean
    loading?: boolean

    image?: {
        src?: string
        alt?: string
        aspectRatio?: ImageAspectRatio
        placeholder?: React.ReactNode
        className?: string
        objectFit?: 'cover' | 'contain' | 'fill'
        loading?: boolean
        onError?: () => void
        fallback?: React.ReactNode
    }

    actions?: ActionItem[]
    showActionsOnHover?: boolean
    actionPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

    badges?: Array<{
        label: string
        variant?: 'filled' | 'outlined' | 'light'
        color?: string
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    }>

    hoverEffect?: HoverEffect | 'custom'
    hoverScale?: number

    contentPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'

    'aria-label'?: string
    role?: string
}

const aspectRatioClasses: Record<ImageAspectRatio, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]',
    tall: 'aspect-[3/4]',
    auto: 'h-44'
}

const sizeClasses: Record<CardSize, { maxWidth: string; minHeight?: string }> = {
    sm: { maxWidth: 'max-w-sm' },
    md: { maxWidth: 'max-w-md' },
    lg: { maxWidth: 'max-w-lg' }
}

type HoverEffect = 'none' | 'lift' | 'scale' | 'glow'

const hoverEffectClasses: Record<HoverEffect, string> = {
    none: '',
    lift: 'hover:shadow-2xl hover:-translate-y-1',
    scale: 'hover:scale-[1.02]',
    glow: 'hover:shadow-glow'
}

const actionPositionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3'
}

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
    'aria-label': ariaLabel,
    role,
    ...rest
}) => {
    const [imageLoadError, setImageLoadError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)

    const hasHeader = title || subtitle || headerAction
    const hasImage = image?.src || image?.placeholder
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
        'rounded-xl overflow-hidden group',
        animations.smooth,
        {
            'cursor-pointer': interactive,
            'active:scale-95': interactive,
            'pointer-events-none opacity-60': loading
        },
        getCardVariantClasses(variant),
        size && sizeClasses[size].maxWidth,
        getHoverClasses(),
        className
    )

    const handleImageLoad = () => {
        setImageLoading(false)
    }

    const handleImageError = () => {
        setImageLoading(false)
        setImageLoadError(true)
        image?.onError?.()
    }

    const ImageSection = () => (
        <Box className="relative overflow-hidden">
            <Box
                className={cn(
                    'w-full overflow-hidden',
                    image?.aspectRatio && image.aspectRatio !== 'auto'
                        ? aspectRatioClasses[image.aspectRatio]
                        : aspectRatioClasses.auto
                )}
            >
                {(imageLoading || image?.loading) && (
                    <Skeleton
                        variant="rectangular"
                        className="w-full h-full absolute inset-0 z-10"
                    />
                )}

                {image?.src && !imageLoadError ? (
                    <img
                        src={image.src}
                        alt={image.alt || ''}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className={cn(
                            'w-full h-full transition-transform duration-700 ease-out',
                            image.objectFit === 'contain' ? 'object-contain' :
                                image.objectFit === 'fill' ? 'object-fill' : 'object-cover',
                            'group-hover:scale-110',
                            {
                                'opacity-0': imageLoading,
                                'opacity-100': !imageLoading
                            },
                            image.className
                        )}
                    />
                ) : imageLoadError && image?.fallback ? (
                    <Box className="w-full h-full">
                        {image.fallback}
                    </Box>
                ) : image?.placeholder ? (
                    <Box className="w-full h-full">
                        {image.placeholder}
                    </Box>
                ) : null}
            </Box>

            {hasBadges && !loading && (
                <>
                    {badges?.map((badge, index) => (
                        <Box
                            key={index}
                            className={cn(
                                'absolute z-20',
                                badge.position === 'top-right' ? 'top-3 right-3' :
                                    badge.position === 'bottom-left' ? 'bottom-3 left-3' :
                                        badge.position === 'bottom-right' ? 'bottom-3 right-3' :
                                            'top-3 left-3'
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
            )}

            {hasActions && !loading && (
                <Box
                    className={cn(
                        'absolute z-20 transition-all duration-300',
                        actionPositionClasses[actionPosition],
                        showActionsOnHover ? 'opacity-0 group-hover:opacity-100 delay-100' : 'opacity-100'
                    )}
                >
                    <FlexBox
                        gap="xs"
                        className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-neutral-100/50 p-1 dark:bg-neutral-900/95 dark:border-neutral-800/50"
                    >
                        {actions?.map((action, index) => (
                            <button
                                key={index}
                                onClick={(e) => action.onClick(e)}
                                disabled={action.disabled}
                                className={cn(
                                    'p-2 rounded-lg transition-all duration-200',
                                    'hover:scale-105 active:scale-95',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                                    action.variant === 'danger'
                                        ? 'text-error-600 hover:bg-error-50 focus-visible:ring-error-500 dark:text-error-400 dark:hover:bg-error-900/30 dark:focus-visible:ring-error-400'
                                        : action.variant === 'primary'
                                            ? 'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/30 dark:focus-visible:ring-primary-400'
                                            : 'text-neutral-600 hover:bg-neutral-50 focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:focus-visible:ring-neutral-400',
                                    action.color
                                )}
                                aria-label={action.label}
                                title={action.label}
                            >
                                <action.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </FlexBox>
                </Box>
            )}
        </Box>
    )

    const ContentSection = () => (
        <Box className={getPaddingClasses(effectivePadding)}>
            {loading ? (
                <Box className="space-y-3">
                    <Skeleton variant="text" className="h-6 w-3/4" />
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-2/3" />
                </Box>
            ) : (
                children
            )}
        </Box>
    )

    const HeaderSection = () => hasHeader ? (
        <Box className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <FlexBox justify="between" align="center">
                <Box className="min-w-0 flex-1">
                    {title && (
                        <Typography
                            variant="heading"
                            className="truncate"
                            color="neutral"
                        >
                            {loading ? <Skeleton variant="text" className="h-6 w-3/4" /> : title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography
                            variant="caption"
                            className="mt-1 truncate"
                            color="muted"
                        >
                            {loading ? <Skeleton variant="text" className="h-4 w-1/2" /> : subtitle}
                        </Typography>
                    )}
                </Box>
                {headerAction && !loading && (
                    <Box className="ml-4 flex-shrink-0">
                        {headerAction}
                    </Box>
                )}
            </FlexBox>
        </Box>
    ) : null

    const FooterSection = () => footer ? (
        <Box className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
            {loading ? (
                <Skeleton variant="text" className="h-4 w-1/3" />
            ) : (
                footer
            )}
        </Box>
    ) : null

    if (hasHeader || footer) {
        return (
            <Box
                className={cardClasses}
                aria-label={ariaLabel}
                role={role}
                {...rest}
            >
                <HeaderSection />
                {hasImage && <ImageSection />}
                <ContentSection />
                <FooterSection />
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
                <ContentSection />
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
            <ContentSection />
        </Box>
    )
}

export default Card