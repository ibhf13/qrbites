import React, { ReactNode } from 'react'
import { Card } from './Card'

interface PageContainerProps {
    title: string
    subtitle?: string
    children: ReactNode
    actions?: ReactNode
    noPadding?: boolean
    withCard?: boolean
    className?: string
}

const PageContainer: React.FC<PageContainerProps> = ({
    title,
    subtitle,
    children,
    actions,
    noPadding = false,
    withCard = true,
    className = '',
}) => {
    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 ${className}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-100">{title}</h1>
                    {subtitle && (
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        {actions}
                    </div>
                )}
            </div>

            {withCard ? (
                <Card noPadding={noPadding}>
                    {children}
                </Card>
            ) : (
                children
            )}
        </div>
    )
}

export default PageContainer 