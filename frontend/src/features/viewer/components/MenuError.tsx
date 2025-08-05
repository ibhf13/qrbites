import React from 'react'
import { Box, Card, Typography } from '@/components/common'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import { MenuErrorProps } from '../types/viewer.types'
import { VIEWER_CONFIG } from '../constants/viewer.constants'

const MenuError: React.FC<MenuErrorProps> = ({ onRetry, error }) => {
    return (
        <Box className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
            <Card
                variant="outlined"
                className="max-w-md w-full text-center border-error-200 dark:border-error-800 h-full flex flex-col"
                contentPadding="sm"
            >
                <Box className="flex-1 space-y-2.5">
                    <Box className="flex flex-col items-center gap-6">
                        <Box className="relative">
                            <QrCodeIcon className={`${VIEWER_CONFIG.ICON_SIZE_XL} text-error-400 dark:text-error-500`} />
                            <Box className="absolute -top-2 -right-2 w-6 h-6 bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center">
                                <span className="text-error-600 dark:text-error-400 text-sm">!</span>
                            </Box>
                        </Box>
                        <Box className="text-center space-y-2.5">
                            <Typography variant="heading" className="font-semibold text-base text-error-700 dark:text-error-300">
                                Menu Unavailable
                            </Typography>
                            <Typography variant="body" className="text-sm text-slate-600 dark:text-slate-300">
                                {error?.message || 'The menu you\'re looking for is currently unavailable'}
                            </Typography>
                            <Typography variant="body" className="text-sm text-slate-500 dark:text-slate-400">
                                The menu might have been moved, removed, or is temporarily unavailable.
                            </Typography>
                        </Box>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                            >
                                Try Again
                            </button>
                        )}
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}

export default MenuError