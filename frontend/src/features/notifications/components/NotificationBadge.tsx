import React from 'react'
import { Badge } from '@/components/common/feedback'
import { NOTIFICATION_UI } from '../constants/notification.constants'

interface NotificationBadgeProps {
    readonly count: number
    readonly showZero?: boolean
    readonly maxCount?: number
    readonly className?: string
    readonly size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    showZero = false,
    maxCount = NOTIFICATION_UI.MAX_VISIBLE_NOTIFICATIONS,
    className,
    size = 'sm',
}) => {
    if (count === 0 && !showZero) return null

    return (
        <Badge
            color="error"
            variant="filled"
            size={size}
            className={className}
            count={count}
            max={maxCount}
            showZero={showZero}
        />
    )
}

export default NotificationBadge 