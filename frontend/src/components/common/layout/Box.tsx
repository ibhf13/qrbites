import React from 'react'
import { cn } from '@/utils/cn'

type Padding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type Margin = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'auto'
type BorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
type Shadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'glow' | 'elevated'
type Background = 'transparent' | 'primary' | 'secondary' | 'white' | 'neutral' | 'glass' | 'surface'
type Border = 'none' | 'light' | 'medium' | 'heavy'

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    p?: Padding
    px?: Padding
    py?: Padding
    pt?: Padding
    pr?: Padding
    pb?: Padding
    pl?: Padding
    m?: Margin
    mx?: Margin
    my?: Margin
    mt?: Margin
    mr?: Margin
    mb?: Margin
    ml?: Margin
    rounded?: BorderRadius
    shadow?: Shadow
    bg?: Background
    border?: Border
    centered?: boolean
    fullWidth?: boolean
    fullHeight?: boolean
    clickable?: boolean
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
}

const paddingMap: Record<Padding, string> = {
    none: 'p-0',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
    '3xl': 'p-16'
}

const paddingXMap: Record<Padding, string> = {
    none: 'px-0',
    xs: 'px-1',
    sm: 'px-2',
    md: 'px-4',
    lg: 'px-6',
    xl: 'px-8',
    '2xl': 'px-12',
    '3xl': 'px-16'
}

const paddingYMap: Record<Padding, string> = {
    none: 'py-0',
    xs: 'py-1',
    sm: 'py-2',
    md: 'py-4',
    lg: 'py-6',
    xl: 'py-8',
    '2xl': 'py-12',
    '3xl': 'py-16'
}

const paddingTopMap: Record<Padding, string> = {
    none: 'pt-0',
    xs: 'pt-1',
    sm: 'pt-2',
    md: 'pt-4',
    lg: 'pt-6',
    xl: 'pt-8',
    '2xl': 'pt-12',
    '3xl': 'pt-16'
}

const paddingRightMap: Record<Padding, string> = {
    none: 'pr-0',
    xs: 'pr-1',
    sm: 'pr-2',
    md: 'pr-4',
    lg: 'pr-6',
    xl: 'pr-8',
    '2xl': 'pr-12',
    '3xl': 'pr-16'
}

const paddingBottomMap: Record<Padding, string> = {
    none: 'pb-0',
    xs: 'pb-1',
    sm: 'pb-2',
    md: 'pb-4',
    lg: 'pb-6',
    xl: 'pb-8',
    '2xl': 'pb-12',
    '3xl': 'pb-16'
}

const paddingLeftMap: Record<Padding, string> = {
    none: 'pl-0',
    xs: 'pl-1',
    sm: 'pl-2',
    md: 'pl-4',
    lg: 'pl-6',
    xl: 'pl-8',
    '2xl': 'pl-12',
    '3xl': 'pl-16'
}

const marginMap: Record<Margin, string> = {
    none: 'm-0',
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12',
    '3xl': 'm-16',
    auto: 'm-auto'
}

const marginXMap: Record<Margin, string> = {
    none: 'mx-0',
    xs: 'mx-1',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
    xl: 'mx-8',
    '2xl': 'mx-12',
    '3xl': 'mx-16',
    auto: 'mx-auto'
}

const marginYMap: Record<Margin, string> = {
    none: 'my-0',
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
    '2xl': 'my-12',
    '3xl': 'my-16',
    auto: 'my-auto'
}

const marginTopMap: Record<Margin, string> = {
    none: 'mt-0',
    xs: 'mt-1',
    sm: 'mt-2',
    md: 'mt-4',
    lg: 'mt-6',
    xl: 'mt-8',
    '2xl': 'mt-12',
    '3xl': 'mt-16',
    auto: 'mt-auto'
}

const marginRightMap: Record<Margin, string> = {
    none: 'mr-0',
    xs: 'mr-1',
    sm: 'mr-2',
    md: 'mr-4',
    lg: 'mr-6',
    xl: 'mr-8',
    '2xl': 'mr-12',
    '3xl': 'mr-16',
    auto: 'mr-auto'
}

const marginBottomMap: Record<Margin, string> = {
    none: 'mb-0',
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
    '2xl': 'mb-12',
    '3xl': 'mb-16',
    auto: 'mb-auto'
}

const marginLeftMap: Record<Margin, string> = {
    none: 'ml-0',
    xs: 'ml-1',
    sm: 'ml-2',
    md: 'ml-4',
    lg: 'ml-6',
    xl: 'ml-8',
    '2xl': 'ml-12',
    '3xl': 'ml-16',
    auto: 'ml-auto'
}

const roundedMap: Record<BorderRadius, string> = {
    none: 'rounded-none',
    xs: 'rounded-xs',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
}

const shadowMap: Record<Shadow, string> = {
    none: 'shadow-none',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glow: 'shadow-glow',
    elevated: 'shadow-elevated'
}

const backgroundMap: Record<Background, string> = {
    transparent: 'bg-transparent',
    primary: 'bg-primary-50 dark:bg-primary-950',
    secondary: 'bg-secondary-50 dark:bg-secondary-950',
    white: 'bg-white dark:bg-neutral-900',
    neutral: 'bg-neutral-50 dark:bg-neutral-900',
    glass: 'glass-morphism',
    surface: 'bg-surface-primary dark:bg-neutral-800'
}

const borderMap: Record<Border, string> = {
    none: 'border-0',
    light: 'border border-neutral-200 dark:border-neutral-700',
    medium: 'border-2 border-neutral-300 dark:border-neutral-600',
    heavy: 'border-4 border-neutral-400 dark:border-neutral-500'
}

const overflowMap = {
    visible: 'overflow-visible',
    hidden: 'overflow-hidden',
    scroll: 'overflow-scroll',
    auto: 'overflow-auto'
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(({
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    rounded = 'none',
    shadow = 'none',
    bg = 'transparent',
    border = 'none',
    centered = false,
    fullWidth = false,
    fullHeight = false,
    clickable = false,
    overflow = 'visible',
    className,
    children,
    ...rest
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                p && paddingMap[p],
                px && paddingXMap[px],
                py && paddingYMap[py],
                pt && paddingTopMap[pt],
                pr && paddingRightMap[pr],
                pb && paddingBottomMap[pb],
                pl && paddingLeftMap[pl],
                m && marginMap[m],
                mx && marginXMap[mx],
                my && marginYMap[my],
                mt && marginTopMap[mt],
                mr && marginRightMap[mr],
                mb && marginBottomMap[mb],
                ml && marginLeftMap[ml],
                roundedMap[rounded],
                shadowMap[shadow],
                backgroundMap[bg],
                borderMap[border],
                overflowMap[overflow],
                centered && 'flex items-center justify-center',
                fullWidth && 'w-full',
                fullHeight && 'h-full',
                clickable && 'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
})

Box.displayName = 'Box'

export default Box