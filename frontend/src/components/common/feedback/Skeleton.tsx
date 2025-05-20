import React from 'react'
import { cn } from '@/utils/cn'
import { Box } from '@/components/common'
import { getSkeletonVariantClasses } from '@/utils/designTokenUtils'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded' | 'avatar' | 'button' | 'card'

export interface SkeletonProps {
    variant?: SkeletonVariant
    width?: string | number
    height?: string | number
    className?: string
    animation?: 'pulse' | 'wave' | 'none'
    lines?: number
    rounded?: boolean
}

const skeletonAnimations = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
    none: ''
}

const skeletonDimensions = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '2.5rem', height: '2.5rem' },
    avatar: { width: '2.5rem', height: '2.5rem' },
    rectangular: { width: '100%', height: '6rem' },
    rounded: { width: '100%', height: '4rem' },
    button: { width: '6rem', height: '2.5rem' },
    card: { width: '100%', height: '12rem' }
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className,
    animation = 'pulse',
    lines = 1,
    rounded = false,
}) => {
    const variantClass = rounded ? 'rounded-lg' : getSkeletonVariantClasses(variant)
    const animationClass = animation !== 'wave' ? skeletonAnimations[animation] : ''

    const defaultDimensions = skeletonDimensions[variant]
    const finalWidth = width || defaultDimensions.width
    const finalHeight = height || defaultDimensions.height

    const styleObj: React.CSSProperties = {
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
    }

    const baseClasses = cn(
        'bg-neutral-200 dark:bg-neutral-700',
        variantClass,
        animationClass
    )

    if (variant === 'text' && lines > 1) {
        return (
            <Box className={cn('space-y-2', className)}>
                {Array.from({ length: lines }, (_, index) => (
                    <Box
                        key={index}
                        className={cn(
                            baseClasses,
                            {
                                [skeletonAnimations.wave]: animation === 'wave'
                            }
                        )}
                        style={{
                            height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
                            width: index === lines - 1 ? '75%' : finalWidth,
                        }}
                        aria-hidden="true"
                    />
                ))}
            </Box>
        )
    }

    return (
        <Box
            className={cn(
                baseClasses,
                {
                    [skeletonAnimations.wave]: animation === 'wave'
                },
                className
            )}
            style={styleObj}
            aria-hidden="true"
            role="presentation"
        />
    )
}

export const SkeletonGroup: React.FC<{
    children: React.ReactNode
    className?: string
}> = ({ children, className }) => {
    return (
        <Box className={cn('animate-pulse', className)} aria-label="Loading content">
            {children}
        </Box>
    )
}

export default Skeleton