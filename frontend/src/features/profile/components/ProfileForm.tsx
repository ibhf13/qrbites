import { Button, ErrorDisplay, FormInput } from '@/components/common'
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

    // Format error message for display
    const getErrorMessage = () => {
        if (typeof updateError === 'object' && updateError !== null && 'error' in updateError &&
            typeof updateError.error === 'object' && updateError.error !== null && 'message' in updateError.error) {
            return String(updateError.error.message)
        }
        return 'Failed to update profile. Please try again.'
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
                label="First Name"
                id="firstName"
                type="text"
                error={errors.firstName?.message}
                {...register('firstName')}
            />

            <FormInput
                label="Last Name"
                id="lastName"
                type="text"
                error={errors.lastName?.message}
                {...register('lastName')}
            />

            <FormInput
                label="Phone Number"
                id="phoneNumber"
                type="tel"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
            />

            {updateError && (
                <ErrorDisplay
                    variant="banner"
                    message={getErrorMessage()}
                />
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={!isDirty || isUpdating}
                    isLoading={isUpdating}
                >
                    Save Changes
                </Button>
            </div>
        </form>
    )
}

export default ProfileForm 