import React from 'react'
import { FlexBox, Box, Typography } from '@/components/common/layout'
import { Button } from '@/components/common/buttons'
import { NotificationItem } from './NotificationItem'
import { cn } from '@/utils/cn'
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline'
import { NotificationListProps } from '../types/notification.types'
import { NOTIFICATION_CLASSES, NOTIFICATION_MESSAGES } from '../constants/notification.constants'
import { useWindowSize } from '@/hooks'

export const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    onDismiss,
    onClearAll,
    maxItems,
    showTimestamp = true,
    compact = false,
    emptyMessage = NOTIFICATION_MESSAGES.EMPTY_STATE,
}) => {
    const displayedNotifications = maxItems
        ? notifications.slice(0, maxItems)
        : notifications

    const hasNotifications = displayedNotifications.length > 0

    const { isMobile } = useWindowSize()
    const isCompact = compact || isMobile

    if (!hasNotifications) {
        return (
            <Box className={cn(
                NOTIFICATION_CLASSES.EMPTY_STATE,
                'p-3 sm:p-6 text-center'
            )}>
                <FlexBox direction="col" align="center" gap="sm" className="sm:gap-4">
                    <BellIcon className="h-6 w-6 sm:h-12 sm:w-12 text-neutral-300 dark:text-neutral-600" />
                    <Typography
                        variant="body"
                        color="muted"
                        className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400"
                    >
                        {emptyMessage}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="muted"
                        className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 max-w-44 sm:max-w-none text-center"
                    >
                        {NOTIFICATION_MESSAGES.EMPTY_STATE_DESCRIPTION}
                    </Typography>
                </FlexBox>
            </Box>
        )
    }

    return (
        <FlexBox direction="col" className={cn(NOTIFICATION_CLASSES.CONTAINER, 'h-full min-w-0')}>
            {onClearAll && (
                <FlexBox
                    justify="between"
                    align="center"
                    className="px-3 py-2 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 min-w-0"
                >
                    <Typography
                        variant="subheading"
                        className="text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100"
                    >
                        Notifications
                    </Typography>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 text-xs sm:text-sm px-2 py-1"
                    >
                        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Clear All</span>
                        <span className="sm:hidden">Clear</span>
                    </Button>
                </FlexBox>
            )}

            {displayedNotifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={onDismiss}
                    showTimestamp={showTimestamp}
                    compact={isCompact}
                />
            ))}

            {maxItems && notifications.length > maxItems && (
                <Box className="px-3 py-2 sm:p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <Typography
                        variant="caption"
                        className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 text-center block"
                    >
                        {notifications.length - maxItems} more notification{notifications.length - maxItems !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            )}
        </FlexBox>
    )
}

export default NotificationList 