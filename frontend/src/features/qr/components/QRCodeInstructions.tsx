import React from 'react'
import { Typography } from '@/components/common'
import { Box } from '@/components/common/layout'

interface QRCodeInstructionsProps {
    className?: string
}

export const QRCodeInstructions: React.FC<QRCodeInstructionsProps> = ({
    className = ''
}) => {
    return (
        <Box
            p="md"
            rounded="lg"
            className={`bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 ${className}`}
        >
            <Typography variant="caption" color="muted" className="text-primary-700 dark:text-primary-300">
                💡 Customers can scan this QR code to view your menu directly on their phones.
                Print and place it on tables, windows, or include it in marketing materials.
            </Typography>
        </Box>
    )
}

export default QRCodeInstructions 