import React, { useEffect } from 'react'
import { Typography, Card, IconButton } from '@/components/common'
import { Box, FlexBox } from '@/components/common/layout'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { QRCodeViewerProps } from '../types/qr.types'
import { useQRCodeActions } from '../hooks/useQRCodeActions'
import { QR_CODE_VIEWER_CONFIG } from '../constants/qr.constants'
import QRCodeDisplay from './QRCodeDisplay'
import QRCodeActions from './QRCodeActions'
import QRCodeInstructions from './QRCodeInstructions'

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
    menuId,
    qrCodeUrl,
    menuName,
    targetUrl,
    onClose
}) => {
    const {
        handleDownload,
        handleCopyUrl,
        handlePreview,
        handlePrint,
        isDownloading
    } = useQRCodeActions({
        menuId,
        menuName,
        qrCodeUrl,
        targetUrl
    })

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleEsc)

        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <Box
            className={`fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex items-center justify-center ${QR_CODE_VIEWER_CONFIG.zIndex} p-4`}
        >
            <Card
                variant="elevated"
                padding="none"
                className={`${QR_CODE_VIEWER_CONFIG.maxWidth} w-full ${QR_CODE_VIEWER_CONFIG.maxHeight} overflow-hidden`}
            >
                <Box border="light" p="md" className="border-neutral-200 dark:border-neutral-700">
                    <FlexBox justify="between" align="center">
                        <Typography as="h4" variant="heading" color="neutral">
                            QR Code for {menuName}
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            icon={XMarkIcon}
                            iconPosition="right"
                        />
                    </FlexBox>
                </Box>

                <Box p="lg">
                    <FlexBox direction="col" gap="xl" className="md:flex-row md:items-start">
                        <Box className="flex-shrink-0 self-center md:self-start">
                            <QRCodeDisplay
                                qrCodeUrl={qrCodeUrl}
                                menuName={menuName}
                                targetUrl={targetUrl}
                            />
                        </Box>

                        <FlexBox direction="col" gap="lg" className="flex-1 min-w-0">
                            <QRCodeActions
                                targetUrl={targetUrl}
                                isDownloading={isDownloading}
                                onDownload={handleDownload}
                                onPrint={handlePrint}
                                onCopyUrl={handleCopyUrl}
                                onPreview={handlePreview}
                            />

                            <QRCodeInstructions />
                        </FlexBox>
                    </FlexBox>
                </Box>
            </Card>
        </Box>
    )
}

export default QRCodeViewer 