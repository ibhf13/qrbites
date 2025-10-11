import { apiRequest, ApiResponse } from '@/config/api'
import { QRCodeResponse } from '../types/qr.types'
import { withErrorHandling } from '@/utils/apiUtils'

export const generateQRCode = async (menuId: string): Promise<ApiResponse<QRCodeResponse>> => {
    return withErrorHandling(async () => {
        return apiRequest<QRCodeResponse>({
            method: 'POST',
            url: `/api/menus/${menuId}/qrcode`
        })
    }, `Failed to generate QR code for menu: ${menuId}`)
}

export const downloadQRCode = async (menuId: string): Promise<Blob> => {
    return withErrorHandling(async () => {
        const response = await fetch(`/api/menus/${menuId}/qrcode`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to generate QR code')
        }

        const data = await response.json()
        const qrCodeUrl = data.data.qrCodeUrl

        const imageResponse = await fetch(qrCodeUrl)

        if (!imageResponse.ok) {
            throw new Error('Failed to fetch QR code image')
        }

        return imageResponse.blob()
    }, `Failed to download QR code for menu: ${menuId}`)
} 