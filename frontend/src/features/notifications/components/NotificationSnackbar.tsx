import { CustomContentProps, SnackbarContent, useSnackbar } from 'notistack'
import React, { forwardRef } from 'react'
import { FlexBox, Box, Typography } from '@/components/common/layout'
import { IconButton } from '@/components/common/buttons'
import { NotificationIcon } from '.'
import { NotificationSeverity } from '../types/notification.types'
import { cn } from '@/utils/cn'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationSnackbarProps extends Omit<CustomContentProps, 'variant'> {
    id: string | number
    message?: React.ReactNode
    variant?: NotificationSeverity
    title?: string
    persistent?: boolean
    // eslint-disable-next-line
    onClose?: (event: any, reason: string) => void
}

export const NotificationSnackbar = forwardRef<HTMLDivElement, NotificationSnackbarProps>((props, ref) => {
    const {
        id,
        message,
        variant = NotificationSeverity.INFO,
        title,
        persistent = false,
        onClose,
    } = props

    const { closeSnackbar } = useSnackbar()

    const handleClose = () => {
        if (id) {
            closeSnackbar(id)
        }

        if (onClose) {
            onClose(undefined, 'clickCloseIcon')
        }
    }

    return (
        <SnackbarContent ref={ref} role="alert">
            <Box
                p="sm"
                rounded="lg"
                className={cn(
                    'min-w-0 max-w-md',
                    'transform transition-all duration-300 ease-out',
                    'hover:scale-105 hover:shadow-xl',
                    'bg-white dark:bg-neutral-800',
                    'border border-neutral-200 dark:border-neutral-700',
                    'shadow-lg dark:shadow-xl'
                )}
            >
                <FlexBox
                    align="center"
                    justify="center"
                >
                    <FlexBox align="center" gap="sm" className="min-w-0 flex-1">
                        <NotificationIcon
                            type={variant}
                            size="md"
                            className="mt-0.5"
                        />

                        <Box className="min-w-0 flex-1">
                            {title && (
                                <Typography
                                    variant="subheading"
                                    className="font-semibold mb-1 text-neutral-900 dark:text-neutral-100"
                                >
                                    {title}
                                </Typography>
                            )}
                            <Typography
                                variant="body"
                                className="break-words leading-relaxed text-neutral-700 dark:text-neutral-300"
                            >
                                {message}
                            </Typography>
                        </Box>
                    </FlexBox>

                    {!persistent && (
                        <Box className="flex-shrink-0 ml-3">
                            <IconButton
                                icon={XMarkIcon}
                                onClick={handleClose}
                                ariaLabel="Close notification"
                                variant="ghost"
                                size="sm"
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 p-1 rounded-md"
                            />
                        </Box>
                    )}
                </FlexBox>
            </Box>
        </SnackbarContent>
    )
})

NotificationSnackbar.displayName = 'NotificationSnackbar'

export default NotificationSnackbar