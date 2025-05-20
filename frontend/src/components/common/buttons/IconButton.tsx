import React from 'react'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import type { ComponentType, ButtonHTMLAttributes, SVGProps } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type IconPosition = 'left' | 'right'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    iconPosition?: IconPosition
    variant?: Variant
    size?: Size
    isLoading?: boolean
    fullWidth?: boolean
    rounded?: boolean
    ariaLabel?: string
    tooltip?: string
    link?: string
}

const iconSizeMap: Record<Size, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
}

const iconOnlySizeMap: Record<Size, string> = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4'
}

export const IconButton: React.FC<IconButtonProps> = (
    {
        icon: Icon,
        iconPosition = 'left',
        variant = 'primary',
        size = 'md',
        isLoading = false,
        fullWidth = false,
        rounded = false,
        ariaLabel,
        tooltip,
        link,
        className,
        children,
        ...rest
    }) => {
    const iconSize = iconSizeMap[size]
    const isIconOnly = !children

    const renderContent = () => {
        if (isIconOnly) {
            return <Icon className={iconSize} aria-hidden />
        }

        if (iconPosition === 'left') {
            return (
                <>
                    <Icon className={cn(iconSize, 'mr-2')} aria-hidden />
                    {children}
                </>
            )
        }

        return (
            <>
                {children}
                <Icon className={cn(iconSize, 'ml-2')} aria-hidden />
            </>
        )
    }

    return (
        <Button
            variant={variant}
            size={size}
            isLoading={isLoading}
            fullWidth={fullWidth}
            rounded={rounded}
            link={link}
            className={cn(
                isIconOnly && iconOnlySizeMap[size],
                className
            )}
            aria-label={isIconOnly ? ariaLabel : undefined}
            title={tooltip || (isIconOnly ? ariaLabel : undefined)}
            {...rest}
        >
            {renderContent()}
        </Button>
    )
}


IconButton.displayName = 'IconButton'

export default IconButton