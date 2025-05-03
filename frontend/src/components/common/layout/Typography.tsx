import React from 'react'

type TypographyVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'overline'

type TypographyColor =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'default'

type TypographyAlign = 'left' | 'center' | 'right'

export interface TypographyProps {
    variant?: TypographyVariant
    color?: TypographyColor
    align?: TypographyAlign
    className?: string
    children: React.ReactNode
    gutterBottom?: boolean
    noWrap?: boolean
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body1',
    color = 'default',
    align = 'left',
    className = '',
    children,
    gutterBottom = false,
    noWrap = false,
}) => {
    const getColorClasses = (): string => {
        switch (color) {
            case 'primary':
                return 'text-primary-700 dark:text-primary-300'
            case 'secondary':
                return 'text-secondary-700 dark:text-secondary-300'
            case 'accent':
                return 'text-accent-600 dark:text-accent-400'
            case 'success':
                return 'text-green-600 dark:text-green-400'
            case 'warning':
                return 'text-amber-600 dark:text-amber-400'
            case 'error':
                return 'text-red-600 dark:text-red-400'
            case 'info':
                return 'text-blue-600 dark:text-blue-400'
            case 'default':
            default:
                return 'text-gray-900 dark:text-gray-100'
        }
    }

    const getAlignClasses = (): string => {
        switch (align) {
            case 'center':
                return 'text-center'
            case 'right':
                return 'text-right'
            case 'left':
            default:
                return 'text-left'
        }
    }

    const getGutterClasses = (): string => {
        return gutterBottom ? 'mb-2' : ''
    }

    const getWrapClasses = (): string => {
        return noWrap ? 'whitespace-nowrap overflow-hidden text-ellipsis' : ''
    }

    const getVariantClasses = (): { classes: string; Component: React.ElementType } => {
        switch (variant) {
            case 'h1':
                return {
                    classes: 'text-4xl font-bold font-display',
                    Component: 'h1',
                }
            case 'h2':
                return {
                    classes: 'text-3xl font-bold font-display',
                    Component: 'h2',
                }
            case 'h3':
                return {
                    classes: 'text-2xl font-semibold font-display',
                    Component: 'h3',
                }
            case 'h4':
                return {
                    classes: 'text-xl font-semibold font-display',
                    Component: 'h4',
                }
            case 'h5':
                return {
                    classes: 'text-lg font-medium font-display',
                    Component: 'h5',
                }
            case 'h6':
                return {
                    classes: 'text-base font-medium font-display',
                    Component: 'h6',
                }
            case 'subtitle1':
                return {
                    classes: 'text-lg font-normal',
                    Component: 'h6',
                }
            case 'subtitle2':
                return {
                    classes: 'text-base font-medium',
                    Component: 'h6',
                }
            case 'body1':
                return {
                    classes: 'text-base font-normal',
                    Component: 'p',
                }
            case 'body2':
                return {
                    classes: 'text-sm font-normal',
                    Component: 'p',
                }
            case 'caption':
                return {
                    classes: 'text-xs font-normal',
                    Component: 'span',
                }
            case 'overline':
                return {
                    classes: 'text-xs font-medium uppercase tracking-wider',
                    Component: 'span',
                }
            default:
                return {
                    classes: 'text-base font-normal',
                    Component: 'p',
                }
        }
    }

    const { classes, Component } = getVariantClasses()
    const colorClasses = getColorClasses()
    const alignClasses = getAlignClasses()
    const gutterClasses = getGutterClasses()
    const wrapClasses = getWrapClasses()

    return (
        <Component
            className={`
        ${classes}
        ${colorClasses}
        ${alignClasses}
        ${gutterClasses}
        ${wrapClasses}
        ${className}
      `}
        >
            {children}
        </Component>
    )
}

export default Typography 