import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box } from '@/components/common/layout'
import { NotificationTrigger, NotificationList } from '../molecules'
import { useNotifications } from '../../hooks/useNotifications'
import { NOTIFICATION_UI, NOTIFICATION_CLASSES } from '../../constants/notification.constants'
import { cn } from '@/utils/cn'

interface NotificationPanelProps {
    readonly maxItems?: number
    readonly className?: string
    readonly triggerVariant?: 'button' | 'icon'
    readonly showBadge?: boolean
    readonly position?: 'left' | 'right'
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    maxItems = NOTIFICATION_UI.MAX_VISIBLE_NOTIFICATIONS,
    className,
    triggerVariant = 'icon',
    showBadge = true,
    position = 'right',
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 })
    const panelRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const { notifications, dismissNotification, clearAllNotifications } = useNotifications()

    const calculatePanelPosition = useCallback(() => {
        if (!triggerRef.current) return { top: 0, left: 0 }

        const rect = triggerRef.current.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        const top = rect.bottom + scrollTop
        const left = position === 'right'
            ? rect.right + scrollLeft - NOTIFICATION_UI.HISTORY_PANEL_WIDTH
            : rect.left + scrollLeft

        return { top: top + 4, left }
    }, [position])

    const handleToggle = useCallback((forceOpen?: boolean) => {
        const newOpen = forceOpen !== undefined ? forceOpen : !isOpen

        if (newOpen && !isOpen) {
            setPanelPosition(calculatePanelPosition())
        }

        setIsOpen(newOpen)
    }, [isOpen, calculatePanelPosition])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleDismiss = useCallback((id: string) => {
        dismissNotification(id)
    }, [dismissNotification])

    const handleClearAll = useCallback(() => {
        clearAllNotifications()
        handleClose()
    }, [clearAllNotifications, handleClose])

    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                handleClose()
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleClose])

    return (
        <Box className={cn('relative', className)}>
            <Box ref={triggerRef}>
                <NotificationTrigger
                    notifications={notifications}
                    onToggle={handleToggle}
                    showBadge={showBadge}
                    variant={triggerVariant}
                />
            </Box>

            {isOpen && (
                <Box
                    ref={panelRef}
                    className={cn(
                        NOTIFICATION_CLASSES.HISTORY_PANEL,
                        'fixed z-[9999] shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 rounded-lg'
                    )}
                    style={{
                        width: NOTIFICATION_UI.HISTORY_PANEL_WIDTH,
                        maxHeight: NOTIFICATION_UI.HISTORY_PANEL_MAX_HEIGHT,
                        top: `${panelPosition.top}px`,
                        left: `${panelPosition.left}px`,
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="notification-panel-heading"
                >
                    <Box className="overflow-y-auto">
                        <NotificationList
                            notifications={notifications}
                            onDismiss={handleDismiss}
                            onClearAll={handleClearAll}
                            maxItems={maxItems}
                            showActions={true}
                            showTimestamp={true}
                            compact={false}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default NotificationPanel 