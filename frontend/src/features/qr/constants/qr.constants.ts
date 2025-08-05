import { QRCodeSize, QRCodeFormatOption, QRCodeCustomization } from '../types/qr.types'

export const QR_CODE_SIZES: readonly QRCodeSize[] = [
    { value: 256, label: '256px (Small)' },
    { value: 512, label: '512px (Medium)' },
    { value: 1024, label: '1024px (Large)' }
] as const

export const QR_CODE_FORMATS: readonly QRCodeFormatOption[] = [
    { value: 'PNG', label: 'PNG (Recommended)' },
    { value: 'SVG', label: 'SVG (Vector)' },
    { value: 'PDF', label: 'PDF (Print Ready)' }
] as const

export const DEFAULT_QR_CUSTOMIZATION: QRCodeCustomization = {
    size: 512,
    format: 'PNG',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 4,
    errorCorrectionLevel: 'M'
}

export const QR_CODE_TIPS: readonly string[] = [
    'Place QR codes at eye level for easy scanning',
    'Ensure good lighting around QR codes',
    'Use high contrast colors for better readability',
    'Test QR codes on different devices before printing',
    'Include a short URL as backup below QR codes',
    'Print QR codes on matte surfaces to avoid glare',
    'Make QR codes at least 2cm x 2cm for mobile scanning'
] as const

