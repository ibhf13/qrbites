import React from 'react'
import { FlexBox, Box, Typography } from '@/components/common/layout'
import { IconButton } from '@/components/common/buttons'
import { NotificationItemProps } from '../types/notification.types'
import { NotificationIcon, NotificationTimestamp } from '.'
import { NOTIFICATION_A11Y, NOTIFICATION_CLASSES } from '../constants/notification.constants'
import { cn } from '@/utils/cn'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onDismiss,
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
                'p-2 sm:px-3 sm:py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200 flex-1',
                {
                    [NOTIFICATION_CLASSES.ITEM_COMPACT]: compact,
                    [NOTIFICATION_CLASSES.ITEM_DISMISSIBLE]: notification.dismissible !== false,
                    [NOTIFICATION_CLASSES.ITEM_PERSISTENT]: notification.persistent,
                }
            )}
            role={NOTIFICATION_A11Y.ROLE_LISTITEM}
        >
            <FlexBox align="start" gap="xs" className="sm:gap-3 w-full">
                <NotificationIcon
                    type={notification.type}
                    size={compact ? 'sm' : 'md'}
                    className="mt-0.5 flex-shrink-0"
                />

                <FlexBox direction="col" className="min-w-0 flex-1">
                    {notification.title && (
                        <Typography
                            variant={compact ? 'body' : 'subheading'}
                            className="font-medium mb-0.5 sm:mb-1 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 leading-tight break-words"
                        >
                            {notification.title}
                        </Typography>
                    )}

                    <Typography
                        variant="body"
                        className="break-words text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed"
                    >
                        {notification.message}
                    </Typography>
                </FlexBox>

                <FlexBox direction="row" align="center" gap="xs" className="flex-shrink-0 ml-2">
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
                            size={compact ? 'xs' : 'sm'}
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