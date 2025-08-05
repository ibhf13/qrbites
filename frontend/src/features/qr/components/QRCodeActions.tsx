import React from 'react'
import { IconButton } from '@/components/common'
import { FlexBox } from '@/components/common/layout'
import {
    EyeIcon,
    ClipboardDocumentIcon,
    PrinterIcon
} from '@heroicons/react/24/outline'
import { QRCodeActionsProps } from '../types/qr.types'

export const QRCodeActions: React.FC<QRCodeActionsProps> = ({
    onPrint,
    onCopyUrl,
    onPreview
}) => {
    return (
        <FlexBox gap="sm" className='w-full'>
            <IconButton
                onClick={onPrint}
                variant="ghost"
                size="sm"
                icon={PrinterIcon}
                iconPosition="left"
                className="w-full flex items-center justify-center gap-2 p-0"

            >
                Print
            </IconButton>

            <IconButton
                onClick={onPreview}
                variant="ghost"
                size="sm"
                icon={EyeIcon}
                iconPosition="left"
                className="w-full flex items-center justify-center gap-2 p-0"
            >
                Preview
            </IconButton>
            <IconButton
                onClick={onCopyUrl}
                variant="ghost"
                size="sm"
                icon={ClipboardDocumentIcon}
                iconPosition="left"
                className="w-full flex items-center justify-center gap-2 p-0"
            >
                Copy URL
            </IconButton>

        </FlexBox>
    )
}

export default QRCodeActions 