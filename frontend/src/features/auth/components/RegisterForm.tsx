import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button, FormInput } from '@/components/common'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useRegister } from '../hooks/useRegister'
import { RegisterFormData } from '../types/auth.types'
import { registerSchema } from '../validations/register.validation'
import AuthCard from './AuthCard'

const RegisterForm: React.FC = () => {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotificationContext()
    const { register: registerUser, isLoading, error, clearError } = useRegister()

    // Clear server error when auth context error changes
    React.useEffect(() => {
        setServerError(error)
    }, [error])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: RegisterFormData) => {
        setServerError(null)
        clearError()

        try {
            const success = await registerUser(data)
            if (success) {
                showSuccess('Registration successful! You can now log in.')
                navigate('/login') // Redirect to login after registration
                reset()
            }
        } catch (error) {
            showError('Registration failed. Please try again.')
            // Error is already handled by the useRegister hook and displayed via serverError
            // No need for additional handling here
        }
    }

    const footerContent = (
        <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Log in
            </a>
        </p>
    )

    return (
        <AuthCard
            title="Create an Account"
            error={serverError}
            footerContent={footerContent}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormInput
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={isSubmitting || isLoading}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <FormInput
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isSubmitting || isLoading}
                    error={errors.password?.message}
                    {...register('password')}
                />

                <div>
                    <Button
                        type="submit"
                        isFullWidth
                        isLoading={isSubmitting || isLoading}
                        disabled={isSubmitting || isLoading}
                    >
                        Register
                    </Button>
                </div>
            </form>
        </AuthCard>
    )
}

export default RegisterForm 