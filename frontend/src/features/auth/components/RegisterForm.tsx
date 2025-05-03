import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button, Card, ErrorDisplay, FormInput } from '@/components/common'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useRegister } from '../hooks/useRegister'
import { RegisterFormData } from '../types/auth.types'
import { registerSchema } from '../validations/register.validation'

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

    return (
        <Card className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create an Account</h2>

            {serverError && (
                <ErrorDisplay
                    message={serverError}
                    variant="banner"
                    className="mb-4"
                />
            )}

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

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Log in
                    </a>
                </p>
            </div>
        </Card>
    )
}

export default RegisterForm 