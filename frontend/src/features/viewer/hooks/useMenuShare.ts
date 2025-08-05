import { useState } from 'react'
import { MenuShareData } from '../types/viewer.types'
import { VIEWER_CONFIG, SHARE_CONFIG } from '../constants/viewer.constants'

export const useMenuShare = () => {
  const [isShareNotificationOpen, setIsShareNotificationOpen] = useState(false)

  const shareMenu = async (shareData: MenuShareData) => {
    if (SHARE_CONFIG.NATIVE_SHARE_SUPPORT) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url)
      setIsShareNotificationOpen(true)
      setTimeout(() => {
        setIsShareNotificationOpen(false)
      }, VIEWER_CONFIG.SHARE_NOTIFICATION_DURATION)
    }
  }

  return {
    shareMenu,
    isShareNotificationOpen,
    closeShareNotification: () => setIsShareNotificationOpen(false)
  }
}