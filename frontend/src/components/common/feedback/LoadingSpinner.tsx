import React from 'react'

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large'
    color?: 'primary' | 'secondary' | 'accent'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    color = 'primary'
}) => {
    // Size classes mapping
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4',
    }

    // Color classes mapping
    const colorClasses = {
        primary: 'border-primary-300 border-t-primary-600',
        secondary: 'border-secondary-300 border-t-secondary-600',
        accent: 'border-accent-300 border-t-accent-600',
    }

    return (
        <div className="flex items-center justify-center">
            <div
                className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full animate-spin border-solid
        `}
                role="status"
                aria-label="Loading"
            />
        </div>
    )
}

export default LoadingSpinner 