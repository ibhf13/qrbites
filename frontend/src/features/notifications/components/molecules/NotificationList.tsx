import React from 'react'
import { FlexBox, Box, Typography } from '@/components/common/layout'
import { Button } from '@/components/common/buttons'
import { NotificationListProps } from '../../types/notification.types'
import { NotificationItem } from './NotificationItem'
import { NOTIFICATION_MESSAGES, NOTIFICATION_A11Y, NOTIFICATION_CLASSES } from '../../constants/notification.constants'
import { cn } from '@/utils/cn'
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline'

export const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    onDismiss,
    onClearAll,
    maxItems,
    showActions = true,
    showTimestamp = true,
    compact = false,
    emptyMessage = NOTIFICATION_MESSAGES.EMPTY_STATE,
}) => {
    const displayedNotifications = maxItems
        ? notifications.slice(0, maxItems)
        : notifications

    const hasNotifications = displayedNotifications.length > 0

    if (!hasNotifications) {
        return (
            <Box className={cn(NOTIFICATION_CLASSES.EMPTY_STATE, 'p-6 text-center')}>
                <FlexBox direction="col" align="center" gap="md">
                    <BellIcon className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                    <Typography
                        variant="body"
                        color="muted"
                        className="text-neutral-600 dark:text-neutral-400"
                    >
                        {emptyMessage}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="muted"
                        className="text-neutral-500 dark:text-neutral-500"
                    >
                        {NOTIFICATION_MESSAGES.EMPTY_STATE_DESCRIPTION}
                    </Typography>
                </FlexBox>
            </Box>
        )
    }

    return (
        <Box className={cn(NOTIFICATION_CLASSES.CONTAINER)}>
            {onClearAll && (
                <FlexBox justify="between" align="center" className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <Typography variant="subheading" className="text-neutral-900 dark:text-neutral-100">
                        Notifications
                    </Typography>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                    >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Clear All
                    </Button>
                </FlexBox>
            )}

            <Box
                className="divide-y divide-neutral-200 dark:divide-neutral-700"
                role="list"
                aria-label="Notifications"
            >
                {displayedNotifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={onDismiss}
                        showActions={showActions}
                        showTimestamp={showTimestamp}
                        compact={compact}
                    />
                ))}
            </Box>

            {maxItems && notifications.length > maxItems && (
                <Box className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <Typography variant="caption" className="text-neutral-500 dark:text-neutral-400 text-center">
                        {notifications.length - maxItems} more notification{notifications.length - maxItems !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            )}
        </Box>
    )
}

export default NotificationList 