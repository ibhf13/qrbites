import React from 'react'
import { Box, Card, LoadingSpinner, Typography } from '@/components/common'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import { VIEWER_CONFIG } from '../constants/viewer.constants'

const MenuLoading: React.FC = () => {
    return (
        <Box className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
            <Card
                variant="elevated"
                className="max-w-md w-full text-center"
                contentPadding="sm"
            >
                <Box className="flex-1 space-y-2.5">
                    <Box className="flex flex-col items-center gap-6">
                        <Box className="relative">
                            <LoadingSpinner size="lg" />
                            <Box className="absolute inset-0 animate-pulse">
                                <QrCodeIcon className={`${VIEWER_CONFIG.LOADING_ICON_SIZE} text-primary-300 dark:text-primary-700 opacity-30`} />
                            </Box>
                        </Box>
                        <Box className="text-center space-y-2.5">
                            <Typography variant="heading" className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                                Loading Menu
                            </Typography>
                            <Typography variant="body" className="text-sm text-slate-600 dark:text-slate-400">
                                Preparing your digital menu experience...
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}

export default MenuLoading