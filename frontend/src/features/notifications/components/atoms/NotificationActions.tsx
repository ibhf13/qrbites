import React from 'react'
import { Button } from '@/components/common/buttons'
import { FlexBox } from '@/components/common/layout'
import { NotificationAction } from '../../types/notification.types'
import { cn } from '@/utils/cn'

interface NotificationActionsProps {
    readonly actions: ReadonlyArray<NotificationAction>
    readonly className?: string
    readonly size?: 'sm' | 'md'
    readonly onActionClick?: (action: NotificationAction) => void
}

export const NotificationActions: React.FC<NotificationActionsProps> = ({
    actions,
    className,
    size = 'sm',
    onActionClick,
}) => {
    if (!actions.length) return null

    const handleActionClick = (action: NotificationAction) => {
        if (!action.disabled) {
            action.onClick()
            onActionClick?.(action)
        }
    }

    return (
        <FlexBox
            gap="sm"
            className={cn('mt-3', className)}
        >
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size={size}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                    className={cn(
                        'text-xs font-medium',
                        action.variant === 'primary' && 'text-white',
                        action.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {action.label}
                </Button>
            ))}
        </FlexBox>
    )
}

export default NotificationActions 