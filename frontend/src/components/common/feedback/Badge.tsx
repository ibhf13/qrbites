import React from 'react'

export type BadgeVariant = 'filled' | 'outlined' | 'light'
export type BadgeColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'default'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
    label: string
    variant?: BadgeVariant
    color?: BadgeColor
    size?: BadgeSize
    icon?: React.ReactNode
    className?: string
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    icon,
    className = '',
}) => {
    const getColorClasses = (): string => {
        const baseColors = {
            primary: {
                filled: 'bg-primary-600 text-white',
                outlined: 'border border-primary-600 text-primary-600',
                light: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
            },
            secondary: {
                filled: 'bg-secondary-600 text-white',
                outlined: 'border border-secondary-600 text-secondary-600',
                light: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
            },
            accent: {
                filled: 'bg-accent-600 text-white',
                outlined: 'border border-accent-600 text-accent-600',
                light: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
            },
            success: {
                filled: 'bg-green-600 text-white',
                outlined: 'border border-green-600 text-green-600',
                light: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            },
            warning: {
                filled: 'bg-amber-600 text-white',
                outlined: 'border border-amber-600 text-amber-600',
                light: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
            },
            error: {
                filled: 'bg-red-600 text-white',
                outlined: 'border border-red-600 text-red-600',
                light: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
            info: {
                filled: 'bg-blue-600 text-white',
                outlined: 'border border-blue-600 text-blue-600',
                light: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            },
            default: {
                filled: 'bg-gray-600 text-white',
                outlined: 'border border-gray-600 text-gray-600',
                light: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            },
        }

        return baseColors[color][variant]
    }

    const getSizeClasses = (): string => {
        switch (size) {
            case 'sm':
                return 'text-xs px-2 py-0.5'
            case 'lg':
                return 'text-sm px-3 py-1.5'
            case 'md':
            default:
                return 'text-xs px-2.5 py-1'
        }
    }

    return (
        <span
            className={`
        inline-flex items-center 
        rounded-full font-medium 
        ${getColorClasses()} 
        ${getSizeClasses()} 
        ${className}
      `}
        >
            {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
            {label}
        </span>
    )
}

export default Badge 