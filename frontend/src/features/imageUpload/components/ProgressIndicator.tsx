import React from 'react'

interface ProgressIndicatorProps {
    percentage: number
    showPercentage?: boolean
    showCancel?: boolean
    onCancel?: () => void
    className?: string
    size?: 'sm' | 'md' | 'lg'
    status?: 'uploading' | 'processing' | 'success' | 'error'
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    percentage,
    showPercentage = true,
    showCancel = true,
    onCancel,
    className = '',
    size = 'md',
    status = 'uploading',
}) => {
    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-4',
    }

    const getStatusColor = () => {
        switch (status) {
            case 'uploading':
                return 'bg-blue-500'
            case 'processing':
                return 'bg-yellow-500'
            case 'success':
                return 'bg-green-500'
            case 'error':
                return 'bg-red-500'
            default:
                return 'bg-blue-500'
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return 'Uploading...'
            case 'processing':
                return 'Processing...'
            case 'success':
                return 'Upload complete'
            case 'error':
                return 'Upload failed'
            default:
                return 'Uploading...'
        }
    }

    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between mb-1">
                {showPercentage && (
                    <div className="text-sm font-medium text-gray-700">
                        {getStatusText()} {percentage}%
                    </div>
                )}
                {showCancel && onCancel && status === 'uploading' && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm text-red-500 hover:text-red-700 focus:outline-none"
                    >
                        Cancel
                    </button>
                )}
            </div>
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${getStatusColor()} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
        </div>
    )
} 