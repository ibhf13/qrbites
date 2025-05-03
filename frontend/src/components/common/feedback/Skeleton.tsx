import React from 'react'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'

export interface SkeletonProps {
    variant?: SkeletonVariant
    width?: string | number
    height?: string | number
    className?: string
    animation?: 'pulse' | 'wave' | 'none'
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    animation = 'pulse',
}) => {
    const getVariantClasses = (): string => {
        switch (variant) {
            case 'text':
                return 'rounded'
            case 'circular':
                return 'rounded-full'
            case 'rectangular':
                return ''
            case 'rounded':
                return 'rounded-lg'
            default:
                return 'rounded'
        }
    }

    const getAnimationClasses = (): string => {
        switch (animation) {
            case 'pulse':
                return 'animate-pulse'
            case 'wave':
                return 'animate-pulse-subtle'
            case 'none':
                return ''
            default:
                return 'animate-pulse'
        }
    }

    // Default dimensions based on variant
    const getDefaultDimensions = (): { width: string | number; height: string | number } => {
        switch (variant) {
            case 'text':
                return { width: '100%', height: '1rem' }
            case 'circular':
                return { width: '40px', height: '40px' }
            case 'rectangular':
                return { width: '100%', height: '100px' }
            case 'rounded':
                return { width: '100%', height: '100px' }
            default:
                return { width: '100%', height: '1rem' }
        }
    }

    const defaultDimensions = getDefaultDimensions()
    const finalWidth = width || defaultDimensions.width
    const finalHeight = height || defaultDimensions.height

    const styleObj: React.CSSProperties = {
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
    }

    return (
        <div
            className={`
        bg-gray-200 dark:bg-gray-700
        ${getVariantClasses()}
        ${getAnimationClasses()}
        ${className}
      `}
            style={styleObj}
        />
    )
}

export default Skeleton 