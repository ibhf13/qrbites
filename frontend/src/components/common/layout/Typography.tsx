import React from 'react'
import { cn } from '@/utils/cn'

type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'small' | 'code'
type Variant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'overline' | 'code'
type Weight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
type Color = 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'inverse'
type Align = 'left' | 'center' | 'right' | 'justify'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    as?: TypographyElement
    variant?: Variant
    weight?: Weight
    color?: Color
    align?: Align
    truncate?: boolean | number
    gradient?: boolean
    className?: string
    children: React.ReactNode
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const variantMap: Record<Variant, string> = {
    display: 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none',
    title: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight',
    heading: 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-snug',
    subheading: 'text-xl md:text-2xl font-semibold tracking-tight leading-snug',
    body: 'text-base md:text-base leading-relaxed',
    caption: 'text-sm md:text-sm leading-normal',
    overline: 'text-xs font-medium uppercase tracking-wide leading-normal',
    code: 'text-sm font-mono leading-normal'
}

const weightMap: Record<Weight, string> = {
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black'
}

const colorMap: Record<Color, string> = {
    primary: 'text-primary-700 dark:text-primary-300',
    secondary: 'text-secondary-700 dark:text-secondary-300',
    accent: 'text-accent-700 dark:text-accent-300',
    neutral: 'text-neutral-900 dark:text-neutral-100',
    success: 'text-success-700 dark:text-success-300',
    warning: 'text-warning-700 dark:text-warning-300',
    error: 'text-error-700 dark:text-error-300',
    info: 'text-info-700 dark:text-info-300',
    muted: 'text-neutral-600 dark:text-neutral-400',
    inverse: 'text-white dark:text-neutral-900'
}

const alignMap: Record<Align, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
}

const defaultElementMap: Record<Variant, TypographyElement> = {
    display: 'h1',
    title: 'h1',
    heading: 'h2',
    subheading: 'h3',
    body: 'p',
    caption: 'span',
    overline: 'span',
    code: 'code'
}

const getTruncateClass = (truncate: boolean | number): string => {
    if (truncate === true) return 'truncate'
    if (typeof truncate === 'number') {
        if (truncate === 2) return 'truncate-2'
        if (truncate === 3) return 'truncate-3'
    }

    return ''
}

const Typography: React.FC<TypographyProps> = ({
    as,
    variant = 'body',
    weight,
    color = 'neutral',
    align = 'left',
    truncate = false,
    gradient = false,
    className,
    children,
    ...rest
}) => {
    const Component = as || defaultElementMap[variant] || 'p'

    const classes = cn(
        variantMap[variant],
        weight && weightMap[weight],
        !gradient && colorMap[color],
        alignMap[align],
        truncate && getTruncateClass(truncate),
        gradient && (
            variant === 'display' || variant === 'title' || variant === 'heading'
                ? 'text-primary'
                : 'text-neutral'
        ),
        className
    )

    return (
        <Component className={classes} {...rest}>
            {children}
        </Component>
    )
}

Typography.displayName = 'Typography'

export default Typography