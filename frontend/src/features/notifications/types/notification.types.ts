export enum NotificationSeverity {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

export enum NotificationPosition {
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    TOP_CENTER = 'top-center',
    BOTTOM_CENTER = 'bottom-center',
}

export interface NotificationAction {
    readonly label: string
    readonly onClick: () => void
    readonly variant?: 'primary' | 'secondary' | 'outline'
    readonly disabled?: boolean
}

export interface NotificationConfig {
    readonly duration?: number
    readonly dismissible?: boolean
    readonly position?: NotificationPosition
    readonly persistent?: boolean
    readonly maxWidth?: number
    readonly showProgress?: boolean
}

export interface NotificationOptions extends NotificationConfig {
    readonly type: NotificationSeverity
    readonly message: string
    readonly title?: string
    readonly actions?: ReadonlyArray<NotificationAction>
    readonly onDismiss?: () => void
    readonly onShow?: () => void
}

export interface Notification extends Required<Pick<NotificationOptions, 'type' | 'message'>> {
    readonly id: string
    readonly timestamp: number
    readonly title?: string
    readonly duration?: number
    readonly dismissible?: boolean
    readonly position?: NotificationPosition
    readonly persistent?: boolean
    readonly maxWidth?: number
    readonly showProgress?: boolean
    readonly actions?: ReadonlyArray<NotificationAction>
    readonly onDismiss?: () => void
    readonly onShow?: () => void
}

export interface NotificationContextValue {
    readonly notifications: ReadonlyArray<Notification>
    readonly showNotification: (options: NotificationOptions) => string
    readonly showSuccess: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    readonly showError: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    readonly showWarning: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    readonly showInfo: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    readonly dismissNotification: (id: string) => void
    readonly clearAllNotifications: () => void
    readonly getNotificationById: (id: string) => Notification | undefined
}

export interface NotificationActions {
    readonly showNotification: NotificationContextValue['showNotification']
    readonly showSuccess: NotificationContextValue['showSuccess']
    readonly showError: NotificationContextValue['showError']
    readonly showWarning: NotificationContextValue['showWarning']
    readonly showInfo: NotificationContextValue['showInfo']
    readonly dismissNotification: NotificationContextValue['dismissNotification']
    readonly clearAllNotifications: NotificationContextValue['clearAllNotifications']
}

export interface NotificationState {
    readonly notifications: ReadonlyArray<Notification>
    readonly hasNotifications: boolean
    readonly unreadCount: number
    readonly getNotificationById: (id: string) => Notification | undefined
}

export interface NotificationItemProps {
    readonly notification: Notification
    readonly onDismiss?: (id: string) => void
    readonly showActions?: boolean
    readonly showTimestamp?: boolean
    readonly compact?: boolean
}

export interface NotificationListProps {
    readonly notifications: ReadonlyArray<Notification>
    readonly onDismiss?: (id: string) => void
    readonly onClearAll?: () => void
    readonly maxItems?: number
    readonly showActions?: boolean
    readonly showTimestamp?: boolean
    readonly compact?: boolean
    readonly emptyMessage?: string
}

export interface NotificationTriggerProps {
    readonly notifications: ReadonlyArray<Notification>
    readonly onToggle?: (isOpen: boolean) => void
    readonly showBadge?: boolean
    readonly variant?: 'button' | 'icon'
    readonly className?: string
}

export interface SnackbarNotificationProps {
    readonly id: string | number
    readonly message?: React.ReactNode
    readonly variant?: NotificationSeverity
    readonly title?: string
    readonly persistent?: boolean
    readonly onClose?: (key: string | number, dismissType: string) => void
} 