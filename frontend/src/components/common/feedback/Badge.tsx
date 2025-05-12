import React from 'react'

export type BadgeVariant = 'filled' | 'outlined' | 'light' | 'dot'
export type BadgeColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'default'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
    label?: string
    variant?: BadgeVariant
    color?: BadgeColor
    size?: BadgeSize
    icon?: React.ReactNode
    className?: string
    count?: number
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    icon,
    className = '',
    count,
}) => {
    const getColorClasses = (): string => {
        const baseColors = {
            primary: {
                filled: 'bg-primary-600 text-white',
                outlined: 'border border-primary-600 text-primary-600',
                light: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
                dot: 'bg-primary-600',
            },
            secondary: {
                filled: 'bg-secondary-600 text-white',
                outlined: 'border border-secondary-600 text-secondary-600',
                light: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
                dot: 'bg-secondary-600',
            },
            accent: {
                filled: 'bg-accent-600 text-white',
                outlined: 'border border-accent-600 text-accent-600',
                light: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
                dot: 'bg-accent-600',
            },
            success: {
                filled: 'bg-green-600 text-white',
                outlined: 'border border-green-600 text-green-600',
                light: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                dot: 'bg-green-600',
            },
            warning: {
                filled: 'bg-amber-600 text-white',
                outlined: 'border border-amber-600 text-amber-600',
                light: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                dot: 'bg-amber-600',
            },
            error: {
                filled: 'bg-red-600 text-white',
                outlined: 'border border-red-600 text-red-600',
                light: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                dot: 'bg-red-600',
            },
            info: {
                filled: 'bg-blue-600 text-white',
                outlined: 'border border-blue-600 text-blue-600',
                light: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                dot: 'bg-blue-600',
            },
            default: {
                filled: 'bg-gray-600 text-white',
                outlined: 'border border-gray-600 text-gray-600',
                light: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                dot: 'bg-gray-600',
            },
        }

        return baseColors[color][variant]
    }

    const getSizeClasses = (): string => {
        if (variant === 'dot') {
            return 'w-2 h-2'
        }

        switch (size) {
            case 'sm':
                return 'text-xs px-1.5 py-0.5 min-w-4 h-4'
            case 'lg':
                return 'text-sm px-2.5 py-1 min-w-6 h-6'
            case 'md':
            default:
                return 'text-xs px-2 py-0.5 min-w-5 h-5'
        }
    }

    // If the variant is dot, just render a small dot
    if (variant === 'dot') {
        return (
            <span
                className={`inline-block rounded-full ${getColorClasses()} ${getSizeClasses()} ${className}`}
                aria-hidden="true"
            />
        )
    }

    // If count is provided, render the count
    const displayContent = count !== undefined ? count : label

    return (
        <span
            className={`
        inline-flex items-center justify-center
        rounded-full font-medium 
        ${getColorClasses()} 
        ${getSizeClasses()} 
        ${className}
      `}
        >
            {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
            {displayContent}
        </span>
    )
}

export default Badge 