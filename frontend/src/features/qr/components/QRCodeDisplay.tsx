import React from 'react'
import { Typography } from '@/components/common'
import { Box, FlexBox } from '@/components/common/layout'
import { QRCodeDisplayProps } from '../types/qr.types'

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
    qrCodeUrl,
    menuName,
    targetUrl,
}) => {
    const sizeClass = 'w-56 h-56'

    return (
        <FlexBox direction="col" align="center" gap="md">
            <Box className={`${sizeClass} border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm overflow-hidden`}>
                <img
                    src={qrCodeUrl}
                    alt={`QR Code for ${menuName}`}
                    className="w-full h-full object-contain"
                />
            </Box>

            {targetUrl && (
                <Box
                    p="sm"
                    rounded="md"
                    className="bg-neutral-50 dark:bg-neutral-800 max-w-sm"
                >
                    <Typography variant="caption" color="muted" className="block mb-1">
                        Scan to view:
                    </Typography>
                    <Typography variant="caption" className="break-all font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        {targetUrl}
                    </Typography>
                </Box>
            )}
        </FlexBox>
    )
}

export default QRCodeDisplay 