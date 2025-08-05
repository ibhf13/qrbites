import React from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Box, FlexBox, Paper, IconButton } from '@/components/common'
import { cn } from '@/utils/cn'

interface FormDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    subtitle?: string
    children: React.ReactNode
    footer?: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
    className?: string
    backdropClassName?: string
    headerClassName?: string
    contentClassName?: string
    footerClassName?: string
    showCloseButton?: boolean
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    'full': 'max-w-full'
}

const FormDialog: React.FC<FormDialogProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = '4xl',
    className,
    backdropClassName,
    headerClassName,
    contentClassName,
    footerClassName,
    showCloseButton = true
}) => {
    const headerActions = showCloseButton ? (
        <IconButton
            icon={XMarkIcon}
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            aria-label="Close dialog"
        />
    ) : undefined

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <Box
                className={cn(
                    "fixed inset-0 bg-black/30 dark:bg-black/50 transition-opacity",
                    backdropClassName
                )}
                aria-hidden="true"
            />

            <FlexBox
                className="fixed inset-0 p-4 overflow-y-auto scrollbar-hide"
                justify="center"
                align="center"
            >
                <DialogPanel className={cn('w-full', maxWidthClasses[maxWidth])}>
                    <Paper
                        title={title}
                        subtitle={subtitle}
                        actions={headerActions}
                        variant="elevated"
                        padding="none"
                        className={cn(
                            'w-full max-h-[95vh] overflow-hidden shadow-2xl',
                            'animate-in fade-in-0 zoom-in-95 duration-200',
                            className
                        )}
                        headerClassName={headerClassName}
                    >
                        <Box
                            className={cn(
                                'overflow-y-auto scrollbar-hide p-6',
                                contentClassName
                            )}
                        >
                            <DialogTitle className="sr-only">
                                {title}
                            </DialogTitle>
                            {children}
                        </Box>

                        {footer && (
                            <Box
                                className={cn(
                                    "border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50",
                                    footerClassName
                                )}
                                bg="neutral"
                            >
                                <FlexBox justify="end" gap="sm">
                                    {footer}
                                </FlexBox>
                            </Box>
                        )}
                    </Paper>
                </DialogPanel>
            </FlexBox>
        </Dialog>
    )
}

export default FormDialog