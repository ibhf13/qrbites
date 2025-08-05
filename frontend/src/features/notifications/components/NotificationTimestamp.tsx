import React from 'react'
import { Typography } from '@/components/common/layout'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { useWindowSize } from '@/hooks/useWindowSize'

interface NotificationTimestampProps {
    readonly timestamp: number
    readonly className?: string
    readonly format?: 'relative' | 'absolute'
    readonly showSeconds?: boolean
}

const formatTimestamp = (
    timestamp: number,
    format: 'relative' | 'absolute',
    showSeconds: boolean,
    isMobile: boolean = false
): string => {
    const date = new Date(timestamp)

    if (format === 'relative') {
        if (isMobile) {
            const now = Date.now()
            const diffMs = now - timestamp
            const diffMinutes = Math.floor(diffMs / (1000 * 60))
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
            const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
            const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))

            if (diffYears >= 1) return `${Math.max(1, diffYears)}y`
            if (diffMonths >= 1) return `${Math.max(1, diffMonths)}mo`
            if (diffDays >= 1) return `${Math.max(1, diffDays)}d`
            if (diffHours >= 1) return `${Math.max(1, diffHours)}h`

            return `${Math.max(1, diffMinutes)}m`
        }

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
    const { isMobile } = useWindowSize()
    const formattedTime = formatTimestamp(timestamp, format, showSeconds, isMobile)

    return (
        <Typography
            variant="caption"
            color="muted"
            className={cn(
                'text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0',
                className
            )}
            title={new Date(timestamp).toLocaleString()}
        >
            {formattedTime}
        </Typography>
    )
}

export default NotificationTimestamp 