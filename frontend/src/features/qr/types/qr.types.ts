export interface QRCodeData {
    url: string
    downloadUrl: string
    publicUrl: string
    generatedAt: string
}

export interface QRCodeResponse {
    qrCodeUrl: string
    qrCodeData: QRCodeData
}

export interface QRCodeViewerProps {
    isOpen: boolean
    qrCodeUrl: string
    menuName: string
    targetUrl?: string
    onClose: () => void
}

export interface QRCodeDisplayProps {
    qrCodeUrl: string
    menuName: string
    targetUrl?: string
}

export interface QRCodeActionsProps {
    onPrint: () => void
    onCopyUrl: () => void
    onPreview: () => void
}

export interface QRCodeCustomization {
    size: number
    format: QRCodeFormat
    foregroundColor: string
    backgroundColor: string
    margin: number
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}

export type QRCodeFormat = 'PNG' | 'PDF' | 'SVG'

export interface QRCodeSize {
    value: number
    label: string
}

export interface QRCodeFormatOption {
    value: QRCodeFormat
    label: string
}

export interface PrintableQRCode {
    menuName: string
    qrCodeUrl: string
    targetUrl?: string
} 