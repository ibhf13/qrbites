import { apiRequest, ApiResponse } from '@/config/api'
import { QRCodeResponse } from '../types/qr.types'

export const generateQRCode = async (menuId: string): Promise<ApiResponse<QRCodeResponse>> => {
    return apiRequest<QRCodeResponse>({
        method: 'POST',
        url: `/api/menus/${menuId}/qrcode`
    })
}

export const downloadQRCode = async (
    menuId: string,
): Promise<Blob> => {
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
} 