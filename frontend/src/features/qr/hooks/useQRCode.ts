import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'

import { generateQRCode } from '../api/qr.api'

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
