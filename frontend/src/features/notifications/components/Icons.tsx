import React from 'react'

export interface IconProps {
    className?: string
    'aria-hidden'?: boolean
}

export const CheckIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
)

export const XMarkIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
)

export const ExclamationTriangleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)

export const InformationCircleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

export const CheckCircleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

export const BellIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
)

export const getNotificationIcon = (type: string, className?: string) => {
    const iconProps = { className: className || "w-5 h-5" }

    switch (type) {
        case 'success':
            return <CheckCircleIcon {...iconProps} />
        case 'error':
            return <XMarkIcon {...iconProps} />
        case 'warning':
            return <ExclamationTriangleIcon {...iconProps} />
        case 'info':
            return <InformationCircleIcon {...iconProps} />
        default:
            return <BellIcon {...iconProps} />
    }
}