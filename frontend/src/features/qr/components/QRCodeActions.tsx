import React from 'react'
import { IconButton, Typography } from '@/components/common'
import { Grid, FlexBox } from '@/components/common/layout'
import {
    ArrowDownTrayIcon,
    EyeIcon,
    ClipboardDocumentIcon,
    PrinterIcon
} from '@heroicons/react/24/outline'
import { QRCodeActionsProps } from '../types/qr.types'

export const QRCodeActions: React.FC<QRCodeActionsProps> = ({
    targetUrl,
    isDownloading = false,
    onDownload,
    onPrint,
    onCopyUrl,
    onPreview
}) => {
    return (
        <FlexBox direction="col" gap="md">
            <Grid cols={2} gap="md">
                <IconButton
                    onClick={() => onDownload('PNG')}
                    variant="primary"
                    size="md"
                    icon={ArrowDownTrayIcon}
                    iconPosition="left"
                    className="w-full"
                    disabled={isDownloading}
                >
                    Download PNG
                </IconButton>
                <IconButton
                    onClick={onPrint}
                    variant="outline"
                    size="md"
                    icon={PrinterIcon}
                    iconPosition="left"
                    className="w-full"
                >
                    Print
                </IconButton>
            </Grid>


            <Grid cols={3} gap="sm">
                <IconButton
                    onClick={() => onDownload('PDF')}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    disabled={isDownloading}
                    icon={ArrowDownTrayIcon}
                    iconPosition="left"
                >
                    <Typography as="p" variant="body" color="neutral">
                        PDF
                    </Typography>
                </IconButton>
                {targetUrl && (
                    <>
                        <IconButton
                            onClick={onPreview}
                            variant="ghost"
                            size="sm"
                            icon={EyeIcon}
                            iconPosition="left"
                            className="w-full"
                        >
                            <Typography as="p" variant="body" color="neutral">
                                Preview
                            </Typography>
                        </IconButton>
                        <IconButton
                            onClick={onCopyUrl}
                            variant="ghost"
                            size="sm"
                            icon={ClipboardDocumentIcon}
                            iconPosition="left"
                            className="w-full"
                        >
                            <Typography as="p" variant="body" color="neutral">
                                Copy URL
                            </Typography>
                        </IconButton>
                    </>
                )}
            </Grid>
        </FlexBox>
    )
}

export default QRCodeActions 