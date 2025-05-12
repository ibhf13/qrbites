import { Button } from '@/components/common/buttons/Button'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import React from 'react'

interface ConfirmationDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    confirmVariant?: 'primary' | 'secondary' | 'accent'
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary',
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onCancel}
            className="relative z-50"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Full-screen container for centering */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon
                                className="h-6 w-6 text-yellow-500"
                                aria-hidden="true"
                            />
                        </div>
                        <div>
                            <Dialog.Title className="text-lg font-medium text-gray-900">
                                {title}
                            </Dialog.Title>
                            <Dialog.Description className="mt-2 text-sm text-gray-500">
                                {message}
                            </Dialog.Description>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={confirmVariant}
                            onClick={onConfirm}
                            isLoading={isLoading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ConfirmationDialog 