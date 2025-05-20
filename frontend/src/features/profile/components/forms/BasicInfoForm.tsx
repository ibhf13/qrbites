import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Card, FormInput, FlexBox } from '@/components/common'
import { ProfileFormData } from '../../utils/profileFormValidation'

interface BasicInfoFormProps {
    email?: string
    register: UseFormRegister<ProfileFormData>
    errors: FieldErrors<ProfileFormData>
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
    email,
    register,
    errors
}) => {
    return (
        <Card title="Basic Information" subtitle="Update your personal details">
            <FlexBox direction="col" gap="md">
                <FormInput
                    label="Email"
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email || 'Not available'}
                    disabled
                    className="bg-neutral-50 dark:bg-neutral-800"
                />

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
            </FlexBox>
        </Card>
    )
}

export default BasicInfoForm 