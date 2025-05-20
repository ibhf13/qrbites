import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { useProfile } from './useProfile'
import { ProfileFormData, profileFormSchema, hasPasswordFields } from '../utils/profileFormValidation'
import { NotificationPosition } from '@/features/notifications/types/notification.types'

export const useProfileForm = () => {
  const { showSuccess, showError } = useNotificationContext()
  const {
    profile,
    updateBasicInfo,
    changePassword,
    isUpdating,
    isChangingPassword,
    updateError,
    passwordChangeError
  } = useProfile()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

    useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      })
    }
  }, [profile, form])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const hasPasswordData = hasPasswordFields(data)

      await updateBasicInfo({
        firstName: data.firstName,
        lastName: data.lastName
      })

      if (hasPasswordData) {
        await changePassword({
          currentPassword: data.currentPassword!,
          newPassword: data.newPassword!
        })

        form.setValue('currentPassword', '')
        form.setValue('newPassword', '')
        form.setValue('confirmNewPassword', '')
      }

      showSuccess(
        hasPasswordData
          ? 'Profile and password updated successfully!'
          : 'Profile updated successfully!',
        {
          duration: 4000,
          position: NotificationPosition.TOP_RIGHT
        }
      )
    } catch (err) {
      console.error('Profile update failed:', err)
      showError('Failed to update profile. Please try again.', {
        duration: 5000,
        position: NotificationPosition.TOP_RIGHT
      })
    }
  }

  const isSubmitting = isUpdating || isChangingPassword
  const submitError = updateError || passwordChangeError

  return {
    form,
    onSubmit,
    isSubmitting,
    submitError
  }
} 