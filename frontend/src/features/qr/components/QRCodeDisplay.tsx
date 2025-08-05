import React from 'react'
import { Typography, Card } from '@/components/common'
import { Box, FlexBox } from '@/components/common/layout'
import { QRCodeDisplayProps } from '../types/qr.types'
import { LinkIcon } from '@heroicons/react/24/outline'

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
    qrCodeUrl,
    menuName,
    targetUrl,
}) => {
    return (
        <Card
            variant="default"
            hoverEffect="none"
            contentPadding="sm"
            className="w-full h-full flex flex-col"
        >
            <FlexBox direction="col" align="center" gap="md" className="flex-1 space-y-2.5">
                <Box className="w-56 h-56 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm overflow-hidden">
                    <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${menuName}`}
                        className="w-full h-full object-contain"
                    />
                </Box>

                <Typography
                    variant="heading"
                    color="neutral"
                    className="font-semibold text-center text-base"
                >
                    {menuName}
                </Typography>

                {targetUrl && (
                    <FlexBox className="gap-2 bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1.5 mt-auto w-full">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                        <Box className="flex-1 min-w-0">
                            <Typography
                                variant="caption"
                                className="text-slate-500 dark:text-slate-400 text-xs block mb-0.5"
                            >
                                Scan to view:
                            </Typography>
                            <Typography
                                variant="caption"
                                className="break-all font-mono text-xs text-slate-600 dark:text-slate-300 line-clamp-2"
                            >
                                {targetUrl}
                            </Typography>
                        </Box>
                    </FlexBox>
                )}
            </FlexBox>
        </Card>
    )
}

export default QRCodeDisplay 