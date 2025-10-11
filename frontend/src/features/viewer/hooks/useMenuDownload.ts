import { useCallback, useState } from 'react'
import { useNotificationContext } from '@/features/notifications'
import { downloadImageFromUrl, getMenuDownloadFilename, checkImageAccess } from '../utils'
import { PublicMenu } from '../types/viewer.types'

interface UseMenuDownloadReturn {
    downloadMenuImage: () => Promise<void>
    isDownloading: boolean
    canDownload: boolean
}

export const useMenuDownload = (menuData?: PublicMenu): UseMenuDownloadReturn => {
    const [isDownloading, setIsDownloading] = useState(false)
    const { showSuccess, showError } = useNotificationContext()

    const canDownload = Boolean(menuData?.imageUrl)

    const downloadMenuImage = useCallback(async () => {
        if (!menuData?.imageUrl) {
            showError('Menu image is not available for download')

            return
        }

        setIsDownloading(true)

        try {
            const isAccessible = await checkImageAccess(menuData.imageUrl)

            if (!isAccessible) {
                throw new Error('Image is not accessible')
            }

            const filename = getMenuDownloadFilename(
                menuData.name || '',
                menuData.restaurant.name,
                menuData.imageUrl
            )

            await downloadImageFromUrl(menuData.imageUrl, filename)

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