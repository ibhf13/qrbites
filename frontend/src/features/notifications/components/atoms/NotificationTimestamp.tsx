import React from 'react'
import { Typography } from '@/components/common/layout'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface NotificationTimestampProps {
    readonly timestamp: number
    readonly className?: string
    readonly format?: 'relative' | 'absolute'
    readonly showSeconds?: boolean
}

const formatTimestamp = (timestamp: number, format: 'relative' | 'absolute', showSeconds: boolean): string => {
    const date = new Date(timestamp)

    if (format === 'relative') {
        return formatDistanceToNow(date, { addSuffix: true })
    }

    if (showSeconds) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const NotificationTimestamp: React.FC<NotificationTimestampProps> = ({
    timestamp,
    className,
    format = 'relative',
    showSeconds = false,
}) => {
    const formattedTime = formatTimestamp(timestamp, format, showSeconds)

    return (
        <Typography
            variant="caption"
            color="muted"
            className={cn(
                'text-neutral-500 dark:text-neutral-400 flex-shrink-0',
                className
            )}
            title={new Date(timestamp).toLocaleString()}
        >
            {formattedTime}
        </Typography>
    )
}

export default NotificationTimestamp 