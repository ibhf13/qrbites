import React from 'react'

export interface CardProps {
    children: React.ReactNode
    className?: string
    title?: string
    subtitle?: string
    footer?: React.ReactNode
    headerAction?: React.ReactNode
    variant?: 'default' | 'outlined' | 'elevated'
    noPadding?: boolean
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    subtitle,
    footer,
    headerAction,
    variant = 'default',
    noPadding = false,
}) => {
    const getCardClasses = (): string => {
        switch (variant) {
            case 'outlined':
                return 'bg-white border border-gray-200'
            case 'elevated':
                return 'bg-white shadow-md'
            default:
                return 'bg-white shadow'
        }
    }

    const cardClasses = `
    rounded-lg 
    overflow-hidden 
    ${getCardClasses()} 
    ${className}
  `

    const hasHeader = title || subtitle || headerAction

    return (
        <div className={cardClasses}>
            {hasHeader && (
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                    {headerAction && <div className="ml-4">{headerAction}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>{children}</div>
            {footer && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">{footer}</div>
            )}
        </div>
    )
}

export default Card 