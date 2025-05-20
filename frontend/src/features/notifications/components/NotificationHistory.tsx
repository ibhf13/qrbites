import React from 'react'
import { NotificationPanel } from './organisms'
import { useNotificationState } from '../hooks/useNotifications'
import { NOTIFICATION_UI } from '../constants/notification.constants'
import { cn } from '@/utils/cn'

interface NotificationHistoryProps {
    maxItems?: number
    className?: string
    triggerVariant?: 'button' | 'icon'
    position?: 'left' | 'right'
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
    maxItems = NOTIFICATION_UI.MAX_VISIBLE_NOTIFICATIONS,
    className,
    triggerVariant = 'icon',
    position = 'right',
}) => {
    const { hasNotifications } = useNotificationState()

    if (!hasNotifications) {
        return null
    }

    return (
        <NotificationPanel
            maxItems={maxItems}
            className={cn('relative', className)}
            triggerVariant={triggerVariant}
            showBadge={true}
            position={position}
        />
    )
}

export default NotificationHistory