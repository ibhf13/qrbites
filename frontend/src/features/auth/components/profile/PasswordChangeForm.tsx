import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Typography, Card, Button, FormInput } from '@/components/common'
import { useChangePasswordAction } from '@/features/auth/hooks/useAuthActions'
import { ChangePasswordFormData } from '../../types/auth.types'
import { changePasswordSchema } from '../../validations/changePassword.validation'
import { ErrorDisplay } from '@/features/errorHandling/components'

export const PasswordChangeForm: React.FC = () => {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const { changePassword, isLoading, clearError } = useChangePasswordAction()

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (data: ChangePasswordFormData) => {
        setSubmitError(null)
        setIsSuccess(false)
        clearError()

        try {
            const result = await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            })

            if (result.success) {
                setIsSuccess(true)
                form.reset()
            } else {
                setSubmitError(result.error || 'Failed to change password')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to change password'

            setSubmitError(errorMessage)
        }
    }

    return (
        <Card variant="outlined" className="h-fit">
            <Box p="lg" className="space-y-6">
                <Box>
                    <Typography variant="heading" className="font-semibold mb-2">
                        Change Password
                    </Typography>
                    <Typography variant="body" color="muted">
                        Update your password to keep your account secure
                    </Typography>
                </Box>

                {isSuccess && (
                    <ErrorDisplay
                        variant="banner"
                        message="Password changed successfully!"
                        className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 border-l-green-500"
                        showIcon={false}
                    />
                )}

                {submitError && (
                    <ErrorDisplay
                        variant="banner"
                        message={submitError}
                    />
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        label="Current Password"
                        id="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        error={form.formState.errors.currentPassword?.message}
                        {...form.register('currentPassword')}
                    />

                    <FormInput
                        label="New Password"
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        error={form.formState.errors.newPassword?.message}
                        {...form.register('newPassword')}
                    />

                    <FormInput
                        label="Confirm New Password"
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        error={form.formState.errors.confirmPassword?.message}
                        {...form.register('confirmPassword')}
                    />

                    <Box className="pt-4">
                        <Button
                            type="submit"
                            fullWidth
                            disabled={!form.formState.isDirty || isLoading}
                            isLoading={isLoading}
                        >
                            Change Password
                        </Button>
                    </Box>
                </form>

                <Box className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Typography variant="caption" color="muted" className="flex items-start space-x-2">
                        <span>💡</span>
                        <span>
                            Use a strong password with at least 8 characters, including uppercase,
                            lowercase letters, and numbers.
                        </span>
                    </Typography>
                </Box>
            </Box>
        </Card>
    )
}
