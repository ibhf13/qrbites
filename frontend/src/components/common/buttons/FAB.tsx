import React from 'react'
import { cn } from '@/utils/cn'
import { IconButton } from './IconButton'
import type { ComponentType, ButtonHTMLAttributes, SVGProps } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
type Size = 'sm' | 'md' | 'lg' | 'xl'
type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

interface FABProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    variant?: Variant
    size?: Size
    position?: Position
    isLoading?: boolean
    ariaLabel: string
    tooltip?: string
    fixed?: boolean
    link?: string
}

const positionMap: Record<Position, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
}

export const FAB: React.FC<FABProps> = (
    {
        icon,
        variant = 'primary',
        size = 'lg',
        position = 'bottom-right',
        isLoading = false,
        ariaLabel,
        tooltip,
        fixed = true,
        link,
        className,
        ...rest
    }) => {
    const fabClasses = cn(
        fixed ? 'fixed' : 'absolute',
        positionMap[position],
        'z-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
        className
    )

    return (
        <IconButton
            icon={icon}
            variant={variant}
            size={size}
            isLoading={isLoading}
            rounded={true}
            link={link}
            ariaLabel={ariaLabel}
            tooltip={tooltip}
            className={fabClasses}
            {...rest}
        />
    )
}


FAB.displayName = 'FAB'

export default FAB