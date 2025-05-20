/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Box } from './Box'

interface PageContainerProps {
    children: ReactNode
    className?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none'
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    background?: 'neutral' | 'white' | 'gray' | 'transparent' | 'primary' | 'secondary' | 'surface'
    centered?: boolean
    fullHeight?: boolean
    responsive?: boolean
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    none: ''
}

const backgroundMap: Record<string, any> = {
    neutral: 'neutral',
    white: 'white',
    gray: 'neutral',
    transparent: 'transparent',
    primary: 'primary',
    secondary: 'secondary',
    surface: 'surface'
}

const paddingMap: Record<string, any> = {
    none: 'none',
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl'
}

const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className,
    maxWidth = '7xl',
    padding = 'lg',
    background = 'neutral',
    centered = true,
    fullHeight = false,
    responsive = true,
}) => {
    const contentClasses = cn(
        'w-full',
        maxWidthClasses[maxWidth],
        {
            'mx-auto': centered && maxWidth !== 'none',
        }
    )

    const getResponsivePadding = () => {
        if (!responsive) return paddingMap[padding]

        switch (padding) {
            case 'xs':
                return 'xs'
            case 'sm':
                return 'sm'
            case 'md':
                return 'md'
            case 'lg':
                return 'lg'
            case 'xl':
                return 'xl'
            case '2xl':
                return '2xl'
            default:
                return 'lg'
        }
    }

    return (
        <Box
            fullWidth
            fullHeight={fullHeight}
            bg={backgroundMap[background]}
            p={getResponsivePadding()}
            centered={centered && maxWidth !== 'none'}
            className={cn(
                {
                    'flex justify-center': centered && maxWidth !== 'none',
                },
                className
            )}
        >
            <div className={contentClasses}>
                {children}
            </div>
        </Box>
    )
}

export default PageContainer