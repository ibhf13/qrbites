import { apiRequest, ApiResponse } from '@/config/api'
import { QRCodeResponse, QRCodeFormat } from '../types/qr.types'

export const generateQRCode = async (menuId: string): Promise<ApiResponse<QRCodeResponse>> => {
    return apiRequest<QRCodeResponse>({
        method: 'POST',
        url: `/api/menus/${menuId}/qrcode`
    })
}

export const downloadQRCode = async (
    menuId: string,
    format: QRCodeFormat = 'PNG'
): Promise<Blob> => {
    const response = await fetch(`/api/menus/${menuId}/qrcode/download?format=${format}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    if (!response.ok) {
        throw new Error('Failed to download QR code')
    }

    return response.blob()
} 