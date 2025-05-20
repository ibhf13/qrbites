import React from 'react'
import { cn } from '@/utils/cn'

interface IconProps {
    className?: string
    'aria-hidden'?: boolean
}

export const ErrorTriangleIcon: React.FC<IconProps> = ({ className, 'aria-hidden': ariaHidden = true }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-6 w-6 text-error-500 dark:text-error-400 flex-shrink-0', className)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden={ariaHidden}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
    </svg>
)

export const CheckmarkIcon: React.FC<IconProps> = ({ className, 'aria-hidden': ariaHidden = true }) => (
    <svg
        className={cn('w-2.5 h-2.5', className)}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden={ariaHidden}
    >
        <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
        />
    </svg>
)

export const SpinnerIcon: React.FC<IconProps & { thickness?: string }> = ({
    className,
    thickness = '2',
    'aria-hidden': ariaHidden = true
}) => (
    <svg
        className={cn('animate-spin', className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden={ariaHidden}
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={thickness}
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
)

export const Icon: React.FC<{
    children: React.ReactNode
    className?: string
    'aria-hidden'?: boolean
}> = ({ children, className, 'aria-hidden': ariaHidden = true }) => (
    <span className={cn('inline-flex items-center justify-center', className)} aria-hidden={ariaHidden}>
        {children}
    </span>
)

export default {
    ErrorTriangle: ErrorTriangleIcon,
    Checkmark: CheckmarkIcon,
    Spinner: SpinnerIcon,
    Icon,
} 