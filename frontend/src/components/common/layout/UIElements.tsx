import React, { ReactNode } from 'react'

interface IconButtonProps {
    icon: ReactNode
    onClick?: () => void
    label: string
    className?: string
    variant?: 'default' | 'primary' | 'danger'
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    label,
    className = '',
    variant = 'default',
}) => {
    const getVariantClasses = (): string => {
        switch (variant) {
            case 'primary':
                return 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 focus:ring-primary-500'
            case 'danger':
                return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:ring-red-500'
            case 'default':
            default:
                return 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 focus:ring-primary-500'
        }
    }

    return (
        <button
            className={`p-1.5 rounded-md ${getVariantClasses()} focus:outline-none focus:ring-2 ${className}`}
            onClick={onClick}
            aria-label={label}
        >
            {icon}
        </button>
    )
}

interface AvatarProps {
    initials: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = 'md',
    className = '',
}) => {
    const getSizeClasses = (): string => {
        switch (size) {
            case 'sm':
                return 'w-6 h-6 text-xs'
            case 'lg':
                return 'w-10 h-10 text-base'
            case 'md':
            default:
                return 'w-8 h-8 text-sm'
        }
    }

    return (
        <div
            className={`rounded-full bg-primary-500 flex items-center justify-center text-white shadow-sm ${getSizeClasses()} ${className}`}
        >
            <span className="font-medium">{initials}</span>
        </div>
    )
}

export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`h-px bg-neutral-200 dark:bg-neutral-700 ${className}`}></div>
) 