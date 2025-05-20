import React, { memo, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Typography } from '@/components/common'
import {
    getBadgeVariantClasses,
    animations,
    sizes,
    type ColorVariant,
    type SizeVariant
} from '@/utils/designTokenUtils'

export type BadgeVariant = 'filled' | 'outlined' | 'light' | 'dot' | 'gradient'
export type BadgeColor = ColorVariant | 'sage' | 'paprika' | 'turmeric' | 'lavender' | 'default'

interface BaseBadgeProps {
    color?: BadgeColor
    size?: SizeVariant
    className?: string
    pulse?: boolean
    'aria-label'?: string
}

interface TextBadgeProps extends BaseBadgeProps {
    variant?: Exclude<BadgeVariant, 'dot'>
    label: string
    icon?: React.ReactNode
    interactive?: boolean
    onClick?: () => void
}

interface NumberBadgeProps extends BaseBadgeProps {
    variant?: Exclude<BadgeVariant, 'dot'>
    count: number
    max?: number
    showZero?: boolean
    interactive?: boolean
    onClick?: () => void
}

interface DotBadgeProps extends BaseBadgeProps {
    variant: 'dot'
}

export type BadgeProps = TextBadgeProps | NumberBadgeProps | DotBadgeProps

const getTextColor = (variant: BadgeVariant, color: BadgeColor): string => {
    if (variant === 'filled' || variant === 'gradient') {
        return 'text-white'
    }

    if (variant === 'outlined') {
        return `text-${color}-700 dark:text-${color}-300`
    }

    if (variant === 'light') {
        return `text-${color}-800 dark:text-${color}-300`
    }

    return 'text-white'
}

const DotBadge = memo<DotBadgeProps>(({
    color = 'primary',
    size = 'md',
    pulse = false,
    className,
    'aria-label': ariaLabel,
}) => (
    <span
        className={cn(
            'inline-block rounded-full',
            getBadgeVariantClasses(color as ColorVariant, 'dot'),
            sizes[size].icon,
            {
                'animate-pulse': pulse
            },
            className
        )}
        aria-label={ariaLabel || `${color} indicator`}
        role="status"
    />
))

DotBadge.displayName = 'DotBadge'

const NumberBadge = memo<NumberBadgeProps>(({
    count,
    max = 99,
    showZero = false,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    pulse = false,
    interactive = false,
    onClick,
    className,
    'aria-label': ariaLabel,
}) => {
    const displayValue = useMemo(() => {
        if (count > max) return `${max}+`
        if (count === 0 && !showZero) return ''

        return count.toString()
    }, [count, max, showZero])

    const shouldRender = count > 0 || showZero

    if (!shouldRender) return null

    const Component = interactive || onClick ? 'button' : 'span'
    const sizeClasses = sizes[size]
    const textColor = getTextColor(variant, color)

    return (
        <Component
            className={cn(
                'inline-flex items-center justify-center rounded-full font-medium select-none',
                animations.transition,
                getBadgeVariantClasses(color as ColorVariant, variant),
                sizeClasses.text,
                sizeClasses.px,
                sizeClasses.py,
                sizeClasses.min,
                sizeClasses.h,
                {
                    'cursor-pointer hover:scale-105 active:scale-95': interactive || onClick,
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-neutral-900': interactive || onClick,
                    'animate-pulse': pulse
                },
                className
            )}
            onClick={onClick}
            type={interactive || onClick ? 'button' : undefined}
            aria-label={ariaLabel || `${count} notifications`}
            {...(interactive && { tabIndex: 0 })}
        >
            <Typography
                variant="caption"
                className={cn('font-medium leading-none', textColor)}
            >
                {displayValue}
            </Typography>
        </Component>
    )
})

NumberBadge.displayName = 'NumberBadge'

const TextBadge = memo<TextBadgeProps>(({
    label,
    icon,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    pulse = false,
    interactive = false,
    onClick,
    className,
    'aria-label': ariaLabel,
}) => {
    if (!label?.trim()) return null

    const Component = interactive || onClick ? 'button' : 'span'
    const sizeClasses = sizes[size]
    const textColor = getTextColor(variant, color)

    return (
        <Component
            className={cn(
                'inline-flex items-center justify-center rounded-full font-medium select-none',
                animations.transition,
                getBadgeVariantClasses(color as ColorVariant, variant),
                sizeClasses.text,
                sizeClasses.px,
                sizeClasses.py,
                sizeClasses.min,
                sizeClasses.h,
                {
                    'cursor-pointer hover:scale-105 active:scale-95': interactive || onClick,
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-neutral-900': interactive || onClick,
                    'animate-pulse': pulse,
                    'gap-1': icon && label
                },
                className
            )}
            onClick={onClick}
            type={interactive || onClick ? 'button' : undefined}
            aria-label={ariaLabel || `Badge: ${label}`}
            {...(interactive && { tabIndex: 0 })}
        >
            {icon && (
                <span
                    className={cn('flex-shrink-0', sizes[size].icon)}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            )}
            <Typography
                variant="caption"
                className={cn('font-medium leading-none', textColor)}
            >
                {label}
            </Typography>
        </Component>
    )
})

TextBadge.displayName = 'TextBadge'

const isDotBadge = (props: BadgeProps): props is DotBadgeProps => {
    return props.variant === 'dot'
}

const isNumberBadge = (props: BadgeProps): props is NumberBadgeProps => {
    return 'count' in props
}

const isTextBadge = (props: BadgeProps): props is TextBadgeProps => {
    return 'label' in props
}

export const Badge: React.FC<BadgeProps> = (props) => {
    if (isDotBadge(props)) {
        return <DotBadge {...props} />
    }

    if (isNumberBadge(props)) {
        return <NumberBadge {...props} />
    }

    if (isTextBadge(props)) {
        return <TextBadge {...props} />
    }

    return null
}

Badge.displayName = 'Badge'

export default Badge