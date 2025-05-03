import { CustomContentProps, SnackbarContent } from 'notistack'
import React, { forwardRef } from 'react'

type VariantIcon = {
    [key: string]: React.ReactNode
}

type VariantType = 'default' | 'success' | 'error' | 'warning' | 'info'

const variantIcon: VariantIcon = {
    success: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
    ),
    error: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    ),
    warning: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
    ),
    info: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    default: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
}

const variantStyles: Record<VariantType, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white',
    default: 'bg-gray-600 text-white',
}

interface NotificationProps extends Omit<CustomContentProps, 'variant'> {
    id: string | number
    message?: React.ReactNode
    variant?: VariantType
    onClose?: (key: string | number, dismissType: string) => void
}

export const NotificationSnackbar = forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
    const {
        id,
        message,
        variant = 'default',
        onClose,
    } = props

    const handleClose = () => {
        if (onClose) {
            onClose(id, 'click')
        }
    }

    return (
        <SnackbarContent ref={ref} role="alert">
            <div
                className={`flex items-center justify-between p-4 rounded-md shadow-md ${variantStyles[variant]}`}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {variantIcon[variant]}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex text-white hover:text-gray-200 focus:outline-none"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </SnackbarContent>
    )
})

NotificationSnackbar.displayName = 'NotificationSnackbar' 