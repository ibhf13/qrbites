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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                </label>
                <input
                    id="currentPassword"
                    type="password"
                    {...register('currentPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                </label>
                <input
                    id="newPassword"
                    type="password"
                    {...register('newPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                </label>
                <input
                    id="confirmNewPassword"
                    type="password"
                    {...register('confirmNewPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>
                )}
            </div>

            {passwordChangeError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {typeof passwordChangeError === 'object' && passwordChangeError !== null && 'error' in passwordChangeError &&
                        typeof passwordChangeError.error === 'object' && passwordChangeError.error !== null && 'message' in passwordChangeError.error
                        ? String(passwordChangeError.error.message)
                        : 'Failed to change password. Please try again.'}
                </div>
            )}

            {successMessage && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                    {successMessage}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
            </div>
        </form>
    )
}

export default PasswordChangeForm 