import React from 'react'
import { IconButton, Button } from '@/components/common/buttons'
import { Box } from '@/components/common/layout'
import { NotificationTriggerProps } from '../../types/notification.types'
import { NotificationBadge } from '../atoms'
import { NOTIFICATION_CLASSES } from '../../constants/notification.constants'
import { cn } from '@/utils/cn'
import { BellIcon } from '@heroicons/react/24/outline'

export const NotificationTrigger: React.FC<NotificationTriggerProps> = ({
    notifications,
    onToggle,
    showBadge = true,
    variant = 'icon',
    className,
}) => {
    const notificationCount = notifications.length
    const hasNotifications = notificationCount > 0

    const handleClick = () => {
        onToggle?.(true)
    }

    const renderTrigger = () => {
        if (variant === 'button') {
            return (
                <Button
                    variant="ghost"
                    size="md"
                    onClick={handleClick}
                    className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    aria-label={`Notifications${hasNotifications ? ` (${notificationCount})` : ''}`}
                >
                    <BellIcon className="h-5 w-5 mr-2" />
                    Notifications
                </Button>
            )
        }

        return (
            <IconButton
                icon={BellIcon}
                variant="ghost"
                size="md"
                onClick={handleClick}
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                ariaLabel={`Notifications${hasNotifications ? ` (${notificationCount})` : ''}`}
            />
        )
    }

    return (
        <Box className={cn(NOTIFICATION_CLASSES.TRIGGER, 'relative', className)}>
            {renderTrigger()}

            {showBadge && hasNotifications && (
                <NotificationBadge
                    count={notificationCount}
                    className="absolute -top-1 -right-1"
                    size="sm"
                />
            )}
        </Box>
    )
}

export default NotificationTrigger 