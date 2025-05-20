import React from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { Button, Card, Typography, IconButton, Box } from '@/components/common'
import { cn } from '@/utils/cn'

export type ConfirmationDialogType = 'warning' | 'danger' | 'success' | 'info'

interface ConfirmationDialogProps {
    isOpen: boolean
    title: string
    message: string
    type?: ConfirmationDialogType
    confirmText?: string
    cancelText?: string
    confirmVariant?: 'primary' | 'secondary' | 'accent' | 'danger'
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
    showCloseButton?: boolean
    icon?: React.ReactNode
}

const dialogIcons = {
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-warning-500 dark:text-warning-400" />,
    danger: <XCircleIcon className="h-6 w-6 text-error-500 dark:text-error-400" />,
    success: <CheckCircleIcon className="h-6 w-6 text-success-500 dark:text-success-400" />,
    info: <InformationCircleIcon className="h-6 w-6 text-info-500 dark:text-info-400" />
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    showCloseButton = true,
    icon
}) => {
    const handleCancel = () => {
        if (!isLoading) {
            onCancel()
        }
    }


    const displayIcon = icon || dialogIcons[type]

    return (
        <Dialog
            open={isOpen}
            onClose={handleCancel}
            className="relative z-50"
        >
            <Box className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

            <Box className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto scrollbar-hide">
                <DialogPanel className="w-full max-w-md">
                    <Card
                        variant="elevated"
                        padding="none"
                        className="mx-auto w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
                    >
                        {showCloseButton && (
                            <Box className="flex justify-between p-4 pb-0 items-center">
                                <DialogTitle className="flex">
                                    <Typography variant="heading" color="neutral">
                                        {title}
                                    </Typography>
                                </DialogTitle>
                                <IconButton
                                    onClick={handleCancel}
                                    className={cn(
                                        'text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400',
                                        {
                                            'opacity-50 cursor-not-allowed': isLoading
                                        }
                                    )}
                                    icon={XMarkIcon}
                                    variant="ghost"
                                    size="sm"
                                    disabled={isLoading}
                                />
                            </Box>
                        )}

                        <Box className={cn('p-6 overflow-y-auto scrollbar-hide', { 'pt-2': showCloseButton })}>
                            <Box className="flex items-start gap-4">
                                <Box className="flex items-center gap-4">
                                    <Box className="flex-shrink-0">
                                        {displayIcon}
                                    </Box>
                                    <Typography as='p' variant="body" color="neutral" className="mt-2 overflow-y-auto scrollbar-hide">
                                        {message}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box className="mt-6 flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                >
                                    {confirmText}
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </DialogPanel>
            </Box>
        </Dialog>
    )
}

export default ConfirmationDialog