import React from 'react'
import Button from '../buttons/Button'

interface ErrorDisplayProps {
    title?: string
    message: string
    onRetry?: () => void
    icon?: React.ReactNode
    className?: string
    variant?: 'inline' | 'full' | 'banner'
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = 'An error occurred',
    message,
    onRetry,
    icon,
    className = '',
    variant = 'inline',
}) => {
    const defaultIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-testid="error-icon"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    )

    const displayIcon = icon || defaultIcon

    switch (variant) {
        case 'full':
            return (
                <div className={`h-full w-full flex items-center justify-center p-8 ${className}`}>
                    <div className="text-center">
                        <div className="inline-block mx-auto mb-4">
                            {displayIcon}
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        {onRetry && (
                            <Button variant="primary" onClick={onRetry}>
                                Try Again
                            </Button>
                        )}
                    </div>
                </div>
            )

        case 'banner':
            return (
                <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {displayIcon}
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{title}</h3>
                            <p className="text-sm text-red-700 mt-1">{message}</p>
                            {onRetry && (
                                <div className="mt-3">
                                    <Button size="sm" variant="outline" onClick={onRetry}>
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )

        case 'inline':
        default:
            return (
                <div className={`flex items-center text-red-600 ${className}`}>
                    <div className="flex-shrink-0 mr-2">
                        {displayIcon}
                    </div>
                    <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm">{message}</p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="text-sm text-red-700 hover:text-red-800 font-medium underline mt-1"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            )
    }
}

export default ErrorDisplay 