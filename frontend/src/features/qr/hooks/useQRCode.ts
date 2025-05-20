import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'

import { generateQRCode, downloadQRCode } from '../api/qr.api'
import { QRCodeFormat } from '../types/qr.types'
import { downloadBlob, getDownloadFilename } from '../utils/qr.utils'

export const useGenerateQRCode = () => {
    const queryClient = useQueryClient()
    const { showSuccess, showError } = useNotificationContext()

    return useMutation({
        mutationFn: generateQRCode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] })
            showSuccess('QR code generated successfully!')
        },
        onError: (error) => {
            console.error('Generate QR code error:', error)
            showError('Failed to generate QR code')
        }
    })
}

export const useDownloadQRCode = () => {
    const { showSuccess, showError } = useNotificationContext()

    return useMutation({
        mutationFn: ({ menuId, format, menuName }: {
            menuId: string
            format?: QRCodeFormat
            menuName?: string
        }) => downloadQRCode(menuId, format),
        onSuccess: (blob, variables) => {
            const filename = getDownloadFilename(
                variables.format || 'PNG',
                variables.menuName
            )

            downloadBlob(blob, filename)
            showSuccess('QR code downloaded successfully!')
        },
        onError: (error) => {
            console.error('Download QR code error:', error)
            showError('Failed to download QR code')
        }
    })
} 