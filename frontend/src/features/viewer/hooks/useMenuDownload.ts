import { useCallback, useState } from 'react'
import { useNotificationContext } from '@/features/notifications'
import { downloadImageFromUrl, getMenuDownloadFilename, checkImageAccess } from '../utils'
import { PublicMenuData } from '../types/viewer.types'

interface UseMenuDownloadReturn {
    downloadMenuImage: () => Promise<void>
    isDownloading: boolean
    canDownload: boolean
}

export const useMenuDownload = (menuData?: PublicMenuData): UseMenuDownloadReturn => {
    const [isDownloading, setIsDownloading] = useState(false)
    const { showSuccess, showError } = useNotificationContext()

    const canDownload = Boolean(menuData?.menu.imageUrl)

    const downloadMenuImage = useCallback(async () => {
        if (!menuData?.menu.imageUrl) {
            showError('Menu image is not available for download')

            return
        }

        setIsDownloading(true)

        try {
            const isAccessible = await checkImageAccess(menuData.menu.imageUrl)

            if (!isAccessible) {
                throw new Error('Image is not accessible')
            }

            const filename = getMenuDownloadFilename(
                menuData.menu.name,
                menuData.menu.restaurant.name,
                menuData.menu.imageUrl
            )

            await downloadImageFromUrl(menuData.menu.imageUrl, filename)

            showSuccess('Menu downloaded successfully!')
        } catch (error) {
            console.error('Menu download error:', error)
            showError('Failed to download menu. Please try again.')
        } finally {
            setIsDownloading(false)
        }
    }, [menuData, showSuccess, showError])

    return {
        downloadMenuImage,
        isDownloading,
        canDownload
    }
}