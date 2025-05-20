import React from 'react'
import { FlexBox, Box, Typography } from '@/components/common/layout'
import { IconButton } from '@/components/common/buttons'
import { NotificationItemProps } from '../../types/notification.types'
import { NotificationIcon, NotificationTimestamp, NotificationActions } from '../atoms'
import { NOTIFICATION_A11Y, NOTIFICATION_CLASSES } from '../../constants/notification.constants'
import { cn } from '@/utils/cn'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onDismiss,
    showActions = true,
    showTimestamp = true,
    compact = false,
}) => {
    const handleDismiss = () => {
        if (onDismiss && notification.dismissible !== false) {
            onDismiss(notification.id)
        }
    }

    return (
        <Box
            className={cn(
                NOTIFICATION_CLASSES.ITEM,
                'p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200',
                {
                    [NOTIFICATION_CLASSES.ITEM_COMPACT]: compact,
                    [NOTIFICATION_CLASSES.ITEM_DISMISSIBLE]: notification.dismissible !== false,
                    [NOTIFICATION_CLASSES.ITEM_PERSISTENT]: notification.persistent,
                }
            )}
            role={NOTIFICATION_A11Y.ROLE_LISTITEM}
        >
            <FlexBox align="start" gap="md">
                <NotificationIcon
                    type={notification.type}
                    size={compact ? 'sm' : 'md'}
                    className="mt-0.5"
                />

                <Box className="flex-1 min-w-0">
                    {notification.title && (
                        <Typography
                            variant={compact ? 'body' : 'subheading'}
                            className="font-medium mb-1 text-neutral-900 dark:text-neutral-100"
                        >
                            {notification.title}
                        </Typography>
                    )}

                    <Typography
                        variant="body"
                        className="break-words text-neutral-700 dark:text-neutral-300"
                    >
                        {notification.message}
                    </Typography>

                    {showActions && notification.actions && notification.actions.length > 0 && (
                        <NotificationActions
                            actions={notification.actions}
                            size={compact ? 'sm' : 'md'}
                        />
                    )}
                </Box>

                <FlexBox direction="col" align="end" gap="sm" className="flex-shrink-0">
                    {showTimestamp && (
                        <NotificationTimestamp
                            timestamp={notification.timestamp}
                            format="relative"
                        />
                    )}

                    {notification.dismissible !== false && (
                        <IconButton
                            icon={XMarkIcon}
                            onClick={handleDismiss}
                            variant="ghost"
                            size="sm"
                            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            ariaLabel="Dismiss notification"
                        />
                    )}
                </FlexBox>
            </FlexBox>
        </Box>
    )
}

export default NotificationItem 