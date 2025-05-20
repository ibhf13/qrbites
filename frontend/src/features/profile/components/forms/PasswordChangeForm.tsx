import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Card, FormInput, FlexBox } from '@/components/common'
import { ProfileFormData } from '../../utils/profileFormValidation'

interface PasswordChangeFormProps {
    register: UseFormRegister<ProfileFormData>
    errors: FieldErrors<ProfileFormData>
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
    register,
    errors
}) => {
    return (
        <Card title="Change Password" subtitle="Update your account password (optional)">
            <FlexBox direction="col" gap="md">
                <FormInput
                    label="Current Password"
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    error={errors.currentPassword?.message}
                    {...register('currentPassword')}
                />

                <FormInput
                    label="New Password"
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                />

                <FormInput
                    label="Confirm New Password"
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    error={errors.confirmNewPassword?.message}
                    {...register('confirmNewPassword')}
                />
            </FlexBox>
        </Card>
    )
}

export default PasswordChangeForm 