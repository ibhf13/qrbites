import React from 'react'
import { Typography } from '@/components/common/layout'
import { FlexBox } from '@/components/common'

interface AvatarProps {
    initials: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = 'sm',
    className = '',
}) => {
    const getSizeClasses = (): { container: string, variant: 'overline' | 'caption' | 'body' } => {
        switch (size) {
            case 'sm':
                return {
                    container: 'w-6 h-6',
                    variant: 'overline'
                }
            case 'lg':
                return {
                    container: 'w-10 h-10',
                    variant: 'body'
                }
            case 'md':
            default:
                return {
                    container: 'w-8 h-8',
                    variant: 'caption'
                }
        }
    }

    const { container, variant } = getSizeClasses()

    return (
        <FlexBox
            align="center"
            justify="center"
            className={`rounded-full bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-sm transition-colors ${container} ${className}`}
        >
            <Typography variant={variant} weight="medium" color="inverse">
                {initials}
            </Typography>
        </FlexBox>
    )
}