import React from 'react'
import { cn } from '@/utils/cn'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
    isLoading?: boolean
    fullWidth?: boolean
    rounded?: boolean
    link?: string
    responsive?: boolean
}

const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:cursor-not-allowed'

const variantMap: Record<Variant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300 dark:bg-primary-500 dark:hover:bg-primary-600 dark:disabled:bg-primary-800 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-300 dark:bg-secondary-500 dark:hover:bg-secondary-600 dark:disabled:bg-secondary-800 shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-600 hover:text-white focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-neutral-900 dark:disabled:border-primary-700 dark:disabled:text-primary-700',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 disabled:text-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:disabled:text-neutral-600',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 disabled:bg-error-300 dark:bg-error-500 dark:hover:bg-error-600 dark:disabled:bg-error-800 shadow-sm hover:shadow-md',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 disabled:bg-success-300 dark:bg-success-500 dark:hover:bg-success-600 dark:disabled:bg-success-800 shadow-sm hover:shadow-md',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 disabled:bg-warning-300 dark:bg-warning-500 dark:hover:bg-warning-600 dark:disabled:bg-warning-800 shadow-sm hover:shadow-md',
    info: 'bg-info-600 text-white hover:bg-info-700 focus:ring-info-500 disabled:bg-info-300 dark:bg-info-500 dark:hover:bg-info-600 dark:disabled:bg-info-800 shadow-sm hover:shadow-md'
}

const sizeMap: Record<Size, string> = {
    xs: 'px-2 py-1 text-xs rounded-md',
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-xl',
    lg: 'px-7 py-3 text-lg rounded-xl',
    xl: 'px-9 py-4 text-xl rounded-2xl'
}

const responsiveSizeMap: Record<Size, string> = {
    xs: 'px-2 py-1.5 text-xs rounded-md min-h-[32px] sm:px-2 sm:py-1 sm:text-xs sm:min-h-[28px]',
    sm: 'px-3 py-2 text-sm rounded-lg min-h-[40px] sm:px-3 sm:py-1.5 sm:text-sm sm:min-h-[36px]',
    md: 'px-5 py-3 text-base rounded-xl min-h-[48px] sm:px-5 sm:py-2.5 sm:text-base sm:min-h-[44px]',
    lg: 'px-7 py-3.5 text-lg rounded-xl min-h-[52px] sm:px-7 sm:py-3 sm:text-lg sm:min-h-[48px]',
    xl: 'px-9 py-4.5 text-xl rounded-2xl min-h-[56px] sm:px-9 sm:py-4 sm:text-xl sm:min-h-[52px]'
}

const iconSizeMap: Record<Size, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    rounded = false,
    responsive = true,
    link,
    className,
    disabled,
    children,
    ...rest
}, ref) => {
    const mergedDisabled = disabled || isLoading

    const buttonClasses = cn(
        base,
        variantMap[variant],
        responsive ? responsiveSizeMap[size] : sizeMap[size],
        fullWidth && 'w-full',
        rounded && 'rounded-full',
        mergedDisabled && 'opacity-50 pointer-events-none',
        className
    )

    const content = isLoading ? (
        <ArrowPathIcon className={cn(iconSizeMap[size], 'animate-spin')} aria-hidden />
    ) : (
        children
    )

    if (link) {
        return (
            <a
                href={link}
                className={buttonClasses}
                onClick={mergedDisabled ? (e) => e.preventDefault() : undefined}
            >
                {content}
            </a>
        )
    }

    return (
        <button
            ref={ref}
            className={buttonClasses}
            disabled={mergedDisabled}
            aria-busy={isLoading}
            {...rest}
        >
            {content}
        </button>
    )
})

Button.displayName = 'Button'

export default Button