import { useCallback } from 'react'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { PrintableQRCode } from '../types/qr.types'
import { copyToClipboard, openInNewTab, printQRCode } from '../utils/qr.utils'

interface UseQRCodeActionsProps {
    menuName: string
    qrCodeUrl: string
    targetUrl?: string
}

export const useQRCodeActions = ({
    menuName,
    qrCodeUrl,
    targetUrl
}: UseQRCodeActionsProps) => {
    const { showSuccess, showError } = useNotificationContext()

    const handleCopyUrl = useCallback(async () => {
        if (!targetUrl) {
            showError('No URL available to copy')

            return
        }

        try {
            await copyToClipboard(targetUrl)
            showSuccess('URL copied to clipboard!')
        } catch (error) {
            console.error('Copy URL error:', error)
            showError('Failed to copy URL')
        }
    }, [targetUrl, showSuccess, showError])

    const handlePreview = useCallback(() => {
        if (!targetUrl) {
            showError('No URL available to preview')

            return
        }

        try {
            openInNewTab(targetUrl)
        } catch (error) {
            console.error('Preview error:', error)
            showError('Failed to open preview')
        }
    }, [targetUrl, showError])

    const handlePrint = useCallback(() => {
        try {
            const printableQRCode: PrintableQRCode = {
                menuName,
                qrCodeUrl,
                targetUrl
            }

            printQRCode(printableQRCode)
        } catch (error) {
            console.error('Print QR code error:', error)
            showError('Failed to print QR code')
        }
    }, [menuName, qrCodeUrl, targetUrl, showError])

    return {
        handleCopyUrl,
        handlePreview,
        handlePrint,
    }
} 