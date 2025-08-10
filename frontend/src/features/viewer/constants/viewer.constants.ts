export const VIEWER_CONFIG = {
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,

  SHARE_NOTIFICATION_DURATION: 2000,

  MAX_IMAGE_HEIGHT: '90vh',
  MIN_IFRAME_HEIGHT_SM: '600px',
  MIN_IFRAME_HEIGHT_LG: '800px',
  MIN_IMAGE_HEIGHT: '400px',

  ICON_SIZE_SM: 'w-3.5 h-3.5',
  ICON_SIZE_MD: 'w-4 h-4',
  ICON_SIZE_LG: 'w-5 h-5',
  ICON_SIZE_XL: 'w-20 h-20',
  ICON_SIZE_2XL: 'w-24 h-24',

  LOADING_ICON_SIZE: 'w-16 h-16',
} as const

export const SHARE_CONFIG = {
  FALLBACK_MESSAGE: 'Menu link copied to clipboard!',
  NATIVE_SHARE_SUPPORT: typeof navigator !== 'undefined' && 'share' in navigator
} as const

export const FILE_TYPES = {
  PDF_EXTENSION: '.pdf'
} as const

export const QUERY_KEYS = {
  PUBLIC_MENU: 'public-menu'
} as const