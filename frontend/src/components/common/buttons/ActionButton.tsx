import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ActionButtonProps {
    children: ReactNode
    icon?: ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    to?: string
    onClick?: () => void
    className?: string
}

const ActionButton: React.FC<ActionButtonProps> = ({
    children,
    icon,
    variant = 'primary',
    to,
    onClick,
    className = ''
}) => {
    const baseStyles = 'font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center'
    const variantStyles = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white',
        secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200',
        outline: 'bg-transparent hover:bg-neutral-50 text-primary-600 border border-primary-300'
    }

    const buttonContent = (
        <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </>
    )

    if (to) {
        return (
            <Link
                to={to}
                className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            >
                {buttonContent}
            </Link>
        )
    }

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        >
            {buttonContent}
        </button>
    )
}

export default ActionButton 