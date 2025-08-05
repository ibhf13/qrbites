import { NotificationConfig, NotificationPosition, NotificationSeverity } from '../types/notification.types'

export const DEFAULT_NOTIFICATION_CONFIG: Required<NotificationConfig> = {
    duration: 5000,
    dismissible: true,
    position: NotificationPosition.TOP_RIGHT,
    persistent: false,
    maxWidth: 400,
    showProgress: false,
} as const

export const NOTIFICATION_DURATION = {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0,
} as const

export const NOTIFICATION_SEVERITY_CONFIG: Record<NotificationSeverity, Partial<NotificationConfig>> = {
    [NotificationSeverity.SUCCESS]: {
        duration: NOTIFICATION_DURATION.SHORT,
        dismissible: true,
        showProgress: false,
    },
    [NotificationSeverity.ERROR]: {
        duration: NOTIFICATION_DURATION.LONG,
        dismissible: true,
        showProgress: false,
    },
    [NotificationSeverity.WARNING]: {
        duration: NOTIFICATION_DURATION.MEDIUM,
        dismissible: true,
        showProgress: false,
    },
    [NotificationSeverity.INFO]: {
        duration: NOTIFICATION_DURATION.MEDIUM,
        dismissible: true,
        showProgress: false,
    },
} as const

export const POSITION_MAPPING = {
    [NotificationPosition.TOP_RIGHT]: { vertical: 'top', horizontal: 'right' },
    [NotificationPosition.TOP_LEFT]: { vertical: 'top', horizontal: 'left' },
    [NotificationPosition.BOTTOM_RIGHT]: { vertical: 'bottom', horizontal: 'right' },
    [NotificationPosition.BOTTOM_LEFT]: { vertical: 'bottom', horizontal: 'left' },
    [NotificationPosition.TOP_CENTER]: { vertical: 'top', horizontal: 'center' },
    [NotificationPosition.BOTTOM_CENTER]: { vertical: 'bottom', horizontal: 'center' },
} as const

export const NOTIFICATION_UI = {
    MAX_VISIBLE_NOTIFICATIONS: 5,
    MAX_HISTORY_ITEMS: 50,
    ANIMATION_DURATION: 300,
    HISTORY_PANEL_WIDTH: 380,
    HISTORY_PANEL_MAX_HEIGHT: 480,
    HISTORY_PANEL_MOBILE_WIDTH: 280,
    HISTORY_PANEL_MOBILE_MAX_HEIGHT: 360,
    SNACKBAR_MAX_WIDTH: 400,
    COMPACT_ITEM_HEIGHT: 64,
    NORMAL_ITEM_HEIGHT: 80,
} as const

export const NOTIFICATION_CLASSES = {
    CONTAINER: 'notification-container',
    ITEM: 'notification-item',
    ITEM_COMPACT: 'notification-item--compact',
    ITEM_DISMISSIBLE: 'notification-item--dismissible',
    ITEM_PERSISTENT: 'notification-item--persistent',
    HISTORY_PANEL: 'notification-history-panel',
    TRIGGER: 'notification-trigger',
    BADGE: 'notification-badge',
    EMPTY_STATE: 'notification-empty-state',
} as const

export const NOTIFICATION_A11Y = {
    LIVE_REGION_POLITE: 'polite',
    LIVE_REGION_ASSERTIVE: 'assertive',
    ROLE_ALERT: 'alert',
    ROLE_STATUS: 'status',
    ROLE_DIALOG: 'dialog',
    ROLE_LISTITEM: 'listitem',
} as const

export const NOTIFICATION_ERRORS = {
    CONTEXT_NOT_FOUND: 'useNotificationContext must be used within a NotificationProvider',
    INVALID_NOTIFICATION_TYPE: 'Invalid notification type provided',
    NOTIFICATION_NOT_FOUND: 'Notification with provided ID not found',
    MISSING_MESSAGE: 'Notification message is required',
} as const

export const NOTIFICATION_FEATURES = {
    ENABLE_SOUND: false,
    ENABLE_VIBRATION: false,
    ENABLE_ANALYTICS: false,
    ENABLE_PERSISTENCE: false,
    ENABLE_OFFLINE_QUEUE: false,
} as const

export const NOTIFICATION_MESSAGES = {
    EMPTY_STATE: 'No notifications yet',
    EMPTY_STATE_DESCRIPTION: 'We\'ll notify you when something important happens',
    CLEAR_ALL_CONFIRM: 'Are you sure you want to clear all notifications?',
    DISMISS_CONFIRM: 'Are you sure you want to dismiss this notification?',
    LOADING: 'Loading notifications...',
    ERROR_LOADING: 'Failed to load notifications',
    RETRY: 'Retry',
} as const

export const NOTIFICATION_CONSTANTS = {
    DEFAULT_CONFIG: DEFAULT_NOTIFICATION_CONFIG,
    DURATION: NOTIFICATION_DURATION,
    SEVERITY_CONFIG: NOTIFICATION_SEVERITY_CONFIG,
    POSITION_MAPPING,
    UI: NOTIFICATION_UI,
    CLASSES: NOTIFICATION_CLASSES,
    A11Y: NOTIFICATION_A11Y,
    ERRORS: NOTIFICATION_ERRORS,
    FEATURES: NOTIFICATION_FEATURES,
    MESSAGES: NOTIFICATION_MESSAGES,
} as const 