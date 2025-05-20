import { useCallback } from 'react'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'

import { useDownloadQRCode } from './useQRCode'
import { QRCodeFormat, PrintableQRCode } from '../types/qr.types'
import { copyToClipboard, openInNewTab, printQRCode } from '../utils/qr.utils'

interface UseQRCodeActionsProps {
    menuId: string
    menuName: string
    qrCodeUrl: string
    targetUrl?: string
}

export const useQRCodeActions = ({
    menuId,
    menuName,
    qrCodeUrl,
    targetUrl
}: UseQRCodeActionsProps) => {
    const { showSuccess, showError } = useNotificationContext()
    const downloadQRMutation = useDownloadQRCode()

    const handleDownload = useCallback(async (format: QRCodeFormat = 'PNG') => {
        try {
            await downloadQRMutation.mutateAsync({
                menuId,
                format,
                menuName
            })
        } catch (error) {
            showError('Failed to download QR code')
        }
    }, [menuId, menuName, downloadQRMutation, showError])

    const handleCopyUrl = useCallback(async () => {
        if (!targetUrl) {
            showError('No URL available to copy')

            return
        }

        try {
            await copyToClipboard(targetUrl)
            showSuccess('URL copied to clipboard!')
        } catch (error) {
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
            showError('Failed to print QR code')
        }
    }, [menuName, qrCodeUrl, targetUrl, showError])

    return {
        handleDownload,
        handleCopyUrl,
        handlePreview,
        handlePrint,
        isDownloading: downloadQRMutation.isPending
    }
} 