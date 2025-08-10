import { QRCodeFormat, PrintableQRCode } from '../types/qr.types'

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

export const getDownloadFilename = (format: QRCodeFormat, menuName?: string): string => {
    const cleanMenuName = menuName ? `-${menuName.replace(/[^a-zA-Z0-9]/g, '-')}` : ''
    const timestamp = new Date().toISOString().split('T')[0]

    return `qr-code${cleanMenuName}-${timestamp}.${format.toLowerCase()}`
}

export const copyToClipboard = async (text: string): Promise<void> => {
    if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported')
    }

    await navigator.clipboard.writeText(text)
}

export const openInNewTab = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer')
}

export const generatePrintHTML = (qrCode: PrintableQRCode): string => {
    return `
        <html>
            <head>
                <title>${qrCode.menuName} - QR Code</title>
                <style>
                    body { 
                        text-align: center; 
                        font-family: Arial, sans-serif; 
                        margin: 40px;
                        line-height: 1.6;
                    }
                    img { 
                        max-width: 400px; 
                        height: auto; 
                        border: 1px solid #ddd;
                        padding: 20px;
                        border-radius: 8px;
                    }
                    h1 { 
                        color: #333; 
                        margin-bottom: 30px; 
                        font-size: 24px;
                    }
                    p { 
                        color: #666; 
                        margin-top: 20px; 
                    }
                    .url {
                        font-size: 12px;
                        word-break: break-all;
                        margin-top: 10px;
                    }
                    .instructions {
                        font-size: 14px;
                        margin-top: 20px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <h1>${qrCode.menuName}</h1>
                <img src="${qrCode.qrCodeUrl}" alt="QR Code for ${qrCode.menuName}" />
                <p class="instructions">Scan this QR code to view the menu</p>
                ${qrCode.targetUrl ? `<p class="url">${qrCode.targetUrl}</p>` : ''}
            </body>
        </html>
    `
}

export const printQRCode = (qrCode: PrintableQRCode): void => {
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
        throw new Error('Unable to open print window')
    }

    const html = generatePrintHTML(qrCode)

    printWindow.document.write(html)
    printWindow.document.close()

    printWindow.onload = () => {
        printWindow.print()
    }
}

export const downloadImageFromUrl = async (imageUrl: string, filename: string): Promise<void> => {
    try {
        const response = await fetch(imageUrl)

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
        }

        const blob = await response.blob()

        downloadBlob(blob, filename)
    } catch (error) {
        console.error('Error downloading image:', error)
        throw new Error('Failed to download image')
    }
} 