import React from 'react'

interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color?: 'primary' | 'secondary' | 'accent' | 'white'
    className?: string
    label?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className = '',
    label,
}) => {
    const getSizeClasses = (): string => {
        switch (size) {
            case 'xs':
                return 'h-4 w-4'
            case 'sm':
                return 'h-6 w-6'
            case 'md':
                return 'h-8 w-8'
            case 'lg':
                return 'h-12 w-12'
            case 'xl':
                return 'h-16 w-16'
            default:
                return 'h-8 w-8'
        }
    }

    const getColorClasses = (): string => {
        switch (color) {
            case 'primary':
                return 'text-primary-600'
            case 'secondary':
                return 'text-secondary-600'
            case 'accent':
                return 'text-accent-600'
            case 'white':
                return 'text-white'
            default:
                return 'text-primary-600'
        }
    }

    const sizeClasses = getSizeClasses()
    const colorClasses = getColorClasses()

    return (
        <div className={`inline-flex flex-col items-center justify-center ${className}`}>
            <svg
                className={`animate-spin ${sizeClasses} ${colorClasses}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                data-testid="loading-spinner"
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
            {label && <span className="mt-2 text-sm text-gray-500">{label}</span>}
        </div>
    )
}

export default LoadingSpinner 