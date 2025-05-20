import React from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Card, Typography, IconButton, Box } from '@/components/common'
import { cn } from '@/utils/cn'

interface FormDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
    className?: string
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
    children,
    maxWidth = '4xl',
    className
}) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <Box className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
            <Box className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto scrollbar-hide">
                <DialogPanel className={cn('w-full', maxWidthClasses[maxWidth])}>
                    <Card className={cn(
                        'w-full max-h-[95vh] overflow-y-auto scrollbar-hide',
                        className
                    )}>
                        <Box className="p-6 overflow-y-auto scrollbar-hide">
                            <Box className="flex justify-between items-center mb-6">
                                <DialogTitle>
                                    <Typography as="h3" variant="heading" className="font-semibold">
                                        {title}
                                    </Typography>
                                </DialogTitle>
                                <IconButton
                                    icon={XMarkIcon}
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                />
                            </Box>
                            <Box className="overflow-y-auto scrollbar-hide">
                                {children}
                            </Box>
                        </Box>
                    </Card>
                </DialogPanel>
            </Box>
        </Dialog>
    )
}

export default FormDialog