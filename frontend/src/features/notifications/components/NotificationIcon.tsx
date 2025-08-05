import React from 'react'
import { NotificationSeverity } from '../types/notification.types'
import { cn } from '@/utils/cn'
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline'

interface NotificationIconProps {
    readonly type: NotificationSeverity
    readonly className?: string
    readonly size?: 'sm' | 'md' | 'lg'
}

const ICON_COMPONENTS = {
    [NotificationSeverity.SUCCESS]: CheckCircleIcon,
    [NotificationSeverity.ERROR]: XCircleIcon,
    [NotificationSeverity.WARNING]: ExclamationTriangleIcon,
    [NotificationSeverity.INFO]: InformationCircleIcon,
} as const

const SIZE_CLASSES = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
} as const

const TYPE_CLASSES = {
    [NotificationSeverity.SUCCESS]: 'text-green-600 dark:text-green-400',
    [NotificationSeverity.ERROR]: 'text-red-600 dark:text-red-400',
    [NotificationSeverity.WARNING]: 'text-yellow-600 dark:text-yellow-400',
    [NotificationSeverity.INFO]: 'text-blue-600 dark:text-blue-400',
} as const

export const NotificationIcon: React.FC<NotificationIconProps> = ({
    type,
    className,
    size = 'md',
}) => {
    const IconComponent = ICON_COMPONENTS[type]

    return (
        <IconComponent
            className={cn(
                'flex-shrink-0',
                SIZE_CLASSES[size],
                TYPE_CLASSES[type],
                className
            )}
            aria-hidden="true"
        />
    )
}

export default NotificationIcon 