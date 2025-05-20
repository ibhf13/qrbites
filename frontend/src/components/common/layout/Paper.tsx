import React, { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Typography from './Typography'

interface PaperProps {
    title?: string
    subtitle?: string
    children: ReactNode
    actions?: ReactNode
    variant?: 'elevated' | 'outlined' | 'filled' | 'none'
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    className?: string
    headerClassName?: string
    contentClassName?: string
    centered?: boolean
    noBorder?: boolean
}

const variantClasses = {
    elevated: 'bg-white shadow-lg border border-gray-200 dark:border-gray-700',
    outlined: 'bg-white border-2 border-gray-300 dark:border-gray-700',
    filled: 'bg-gray-50 border border-gray-200 dark:border-gray-700',
    none: ''
}

const paddingClasses = {
    none: '',
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
    '2xl': 'p-12'
}

const Paper: React.FC<PaperProps> = ({
    title,
    subtitle,
    children,
    actions,
    variant = 'elevated',
    padding = 'lg',
    className,
    headerClassName,
    contentClassName,
    centered = false,
    noBorder = false,
}) => {
    const hasHeader = title || subtitle || actions

    const paperClasses = cn(
        'rounded-lg overflow-hidden',
        variantClasses[variant],
        {
            'border-0': noBorder,
        },
        className
    )

    const headerClasses = cn(
        'flex justify-between items-start border-b border-gray-200',
        {
            'flex-col items-center': centered,
            'flex-row items-center': !centered,
        },
        paddingClasses[padding],
        headerClassName
    )

    const contentClasses = cn(
        paddingClasses[padding],
        {
            'pt-0': hasHeader && padding !== 'none',
        },
        contentClassName
    )

    return (
        <div className={paperClasses}>
            {hasHeader && (
                <div className={headerClasses}>
                    {(title || subtitle) && (
                        <div className={cn('min-w-0', { 'text-center': centered, 'mb-4': centered && actions })}>
                            {title && (
                                <Typography
                                    as="h1"
                                    color="neutral"
                                    className="font-display font-bold tracking-tight text-2xl"
                                >
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography
                                    as="p"
                                    variant="body"
                                    color="neutral"
                                    className="mt-2 max-w-3xl"
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </div>
                    )}
                    {actions && (
                        <div className={cn(
                            'flex gap-3 flex-wrap',
                            {
                                'justify-center': centered,
                                'justify-end': !centered && (title || subtitle),
                                'justify-start': !centered && !title && !subtitle,
                                'mt-0': !centered,
                                'w-full': !title && !subtitle
                            }
                        )}>
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div className={contentClasses}>
                {children}
            </div>
        </div>
    )
}

export default Paper 