import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box } from '@/components/common/layout'
import { cn } from '@/utils/cn'
import { NotificationList, NotificationTrigger } from '.'
import { NOTIFICATION_CLASSES, NOTIFICATION_UI } from '../constants/notification.constants'
import { useNotifications } from '../hooks'
import { useWindowSize } from '@/hooks'

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
    const { width: windowWidth, isMobile } = useWindowSize()

    const calculatePanelPosition = useCallback(() => {
        if (!triggerRef.current) return { top: 0, left: 0 }

        const rect = triggerRef.current.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        const panelWidth = isMobile
            ? NOTIFICATION_UI.HISTORY_PANEL_MOBILE_WIDTH
            : NOTIFICATION_UI.HISTORY_PANEL_WIDTH

        const top = rect.bottom + scrollTop
        let left: number

        if (isMobile) {
            const centerPosition = (windowWidth - panelWidth) / 2
            const minLeft = 16
            const maxLeft = windowWidth - panelWidth - 16

            left = Math.max(minLeft, Math.min(centerPosition, maxLeft)) + scrollLeft
        } else {
            left = position === 'right'
                ? rect.right + scrollLeft - panelWidth
                : rect.left + scrollLeft
        }

        return { top: top + 4, left }
    }, [position, isMobile, windowWidth])

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

        const handleResize = () => {
            setPanelPosition(calculatePanelPosition())
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        window.addEventListener('resize', handleResize)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('resize', handleResize)
        }
    }, [isOpen, handleClose, calculatePanelPosition])

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
                        'fixed z-[9999] shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 rounded-lg',
                        'w-[280px] max-h-[360px]',
                        'sm:w-[380px] sm:max-h-[480px]'
                    )}
                    style={{
                        top: `${panelPosition.top}px`,
                        left: `${panelPosition.left}px`,
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="notification-panel-heading"
                >
                    <Box className="overflow-y-auto scrollbar-hide h-full">
                        <NotificationList
                            notifications={notifications}
                            onDismiss={handleDismiss}
                            onClearAll={handleClearAll}
                            maxItems={maxItems}
                            showTimestamp={true}
                            compact={isMobile}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default NotificationPanel 