import { Button, ErrorDisplay, FormInput } from '@/components/common'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useProfileData } from '../hooks/useProfileData'
import { PasswordChangeFormData } from '../types/profile.types'
import { passwordChangeSchema } from '../validations/profileValidation'

const PasswordChangeForm: React.FC = () => {
    const { changePassword, isChangingPassword, passwordChangeError, passwordChangeSuccess } = useProfileData()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        }
    })

    const onSubmit = (data: PasswordChangeFormData) => {
        // Remove confirmNewPassword field before sending to API
        const { confirmNewPassword, ...passwordData } = data

        changePassword(passwordData, {
            onSuccess: (response) => {
                setSuccessMessage(response.message || 'Password changed successfully')
                reset()

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 5000)
            }
        })
    }

    // Format error message for display
    const getErrorMessage = () => {
        if (typeof passwordChangeError === 'object' && passwordChangeError !== null && 'error' in passwordChangeError &&
            typeof passwordChangeError.error === 'object' && passwordChangeError.error !== null && 'message' in passwordChangeError.error) {
            return String(passwordChangeError.error.message)
        }
        return 'Failed to change password. Please try again.'
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
                label="Current Password"
                id="currentPassword"
                type="password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
            />

            <FormInput
                label="New Password"
                id="newPassword"
                type="password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
            />

            <FormInput
                label="Confirm New Password"
                id="confirmNewPassword"
                type="password"
                error={errors.confirmNewPassword?.message}
                {...register('confirmNewPassword')}
            />

            {passwordChangeError && (
                <ErrorDisplay
                    variant="banner"
                    message={getErrorMessage()}
                />
            )}

            {successMessage && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                    {successMessage}
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isChangingPassword}
                    isLoading={isChangingPassword}
                >
                    Change Password
                </Button>
            </div>
        </form>
    )
}

export default PasswordChangeForm 