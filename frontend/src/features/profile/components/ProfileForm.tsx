import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useProfileData } from '../hooks/useProfileData'
import { ProfileFormData } from '../types/profile.types'
import { profileFormSchema } from '../validations/profileValidation'

interface ProfileFormProps {
    initialData?: {
        firstName?: string
        lastName?: string
        phoneNumber?: string
    }
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
    const { updateProfile, isUpdating, updateError } = useProfileData()

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: initialData?.firstName || '',
            lastName: initialData?.lastName || '',
            phoneNumber: initialData?.phoneNumber || ''
        }
    })

    // Reset form with new initialData when it changes
    React.useEffect(() => {
        if (initialData) {
            reset({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                phoneNumber: initialData.phoneNumber || ''
            })
        }
    }, [initialData, reset])

    const onSubmit = (data: ProfileFormData) => {
        updateProfile(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                </label>
                <input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                </label>
                <input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                </label>
                <input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
            </div>

            {updateError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {typeof updateError === 'object' && updateError !== null && 'error' in updateError && typeof updateError.error === 'object' && updateError.error !== null && 'message' in updateError.error
                        ? String(updateError.error.message)
                        : 'Failed to update profile. Please try again.'}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!isDirty || isUpdating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}

export default ProfileForm 