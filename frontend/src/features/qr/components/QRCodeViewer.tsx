import React from 'react'
import { FormDialog } from '@/components/common/dialogs'
import { FlexBox } from '@/components/common/layout'
import { QRCodeViewerProps } from '../types/qr.types'
import { useQRCodeActions } from '../hooks/useQRCodeActions'
import QRCodeDisplay from './QRCodeDisplay'
import QRCodeActions from './QRCodeActions'

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
    isOpen,
    qrCodeUrl,
    menuName,
    targetUrl,
    onClose
}) => {
    const {
        handleCopyUrl,
        handlePreview,
        handlePrint,
    } = useQRCodeActions({
        menuName,
        qrCodeUrl,
        targetUrl
    })

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={`QR Code for ${menuName}`}
            maxWidth="xl"
            className='p-0'
            contentClassName='py-0 px-0'
            headerClassName='p-2'
        >
            <FlexBox direction="col" justify='center' align='center' gap='sm' className='p-2'>
                <QRCodeActions
                    onPrint={handlePrint}
                    onCopyUrl={handleCopyUrl}
                    onPreview={handlePreview}
                />
                <QRCodeDisplay
                    qrCodeUrl={qrCodeUrl}
                    menuName={menuName}
                    targetUrl={targetUrl}
                />
            </FlexBox>
        </FormDialog>
    )
}

export default QRCodeViewer 