import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    isFullWidth?: boolean
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    className?: string
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isFullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...rest
}) => {
    const getVariantClasses = (): string => {
        switch (variant) {
            case 'primary':
                return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            case 'secondary':
                return 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500'
            case 'accent':
                return 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500'
            case 'outline':
                return 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
            case 'ghost':
                return 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
            case 'link':
                return 'bg-transparent text-primary-600 hover:underline focus:ring-primary-500 p-0'
            default:
                return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
        }
    }

    const getSizeClasses = (): string => {
        switch (size) {
            case 'xs':
                return 'text-xs px-2 py-1'
            case 'sm':
                return 'text-sm px-3 py-1.5'
            case 'md':
                return 'text-base px-4 py-2'
            case 'lg':
                return 'text-lg px-5 py-2.5'
            case 'xl':
                return 'text-xl px-6 py-3'
            default:
                return 'text-base px-4 py-2'
        }
    }

    const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

    const widthClass = isFullWidth ? 'w-full' : ''
    const variantClasses = getVariantClasses()
    const sizeClasses = variant === 'link' ? 'text-base' : getSizeClasses()

    return (
        <button
            className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
        ${widthClass}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    )
}

export default Button 