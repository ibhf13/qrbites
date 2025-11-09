import React from 'react'
import { cn } from '@/utils/cn'
import Typography from './Typography'

type Orientation = 'horizontal' | 'vertical'

interface DividerProps {
    orientation?: Orientation
    text?: string
    className?: string
}

const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    text,
    className = ''
}) => {
    if (orientation === 'vertical') {
        return (
            <div
                className={cn(
                    'w-px bg-neutral-200 dark:bg-neutral-700',
                    className
                )}
                role="separator"
                aria-orientation="vertical"
            />
        )
    }

    if (text) {
        return (
            <div className={cn('relative flex items-center', className)} role="separator">
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-700" />
                <Typography
                    variant="body"
                    color="muted"
                    className="px-4 text-sm"
                >
                    {text}
                </Typography>
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-700" />
            </div>
        )
    }

    return (
        <hr
            className={cn(
                'border-t border-neutral-200 dark:border-neutral-700',
                className
            )}
            role="separator"
        />
    )
}

export default Divider

