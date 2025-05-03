import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button, Card, ErrorDisplay, FormInput } from '@/components/common'
import env from '@/config/env'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useLogin } from '../hooks/useLogin'
import { LoginFormData } from '../types/auth.types'
import { loginSchema } from '../validations/login.validation'

const LoginForm: React.FC = () => {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotificationContext()
    const { login, isLoading, error, clearError } = useLogin()

    // Clear server error when auth context error changes
    useEffect(() => {
        setServerError(error)
    }, [error])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null)
        clearError()

        try {
            const success = await login(data)
            if (success) {
                showSuccess('Login successful!')
                navigate('/dashboard') // Redirect to dashboard after login
                reset()
            }
        } catch (error) {
            showError('Login failed. Please check your credentials and try again.')
        }
    }

    const handleDemoLogin = () => {
        // Set demo credentials
        setValue('email', env.demoEmail)
        setValue('password', env.demoPassword)
        setValue('rememberMe', true)

        // Submit the form with demo credentials
        const demoCredentials: LoginFormData = {
            email: env.demoEmail,
            password: env.demoPassword,
            rememberMe: true
        }

        onSubmit(demoCredentials)
    }

    return (
        <Card className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log In</h2>

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

                <div className="flex items-center">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        {...register('rememberMe')}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                </div>

                <div>
                    <Button
                        type="submit"
                        isFullWidth
                        isLoading={isSubmitting || isLoading}
                        disabled={isSubmitting || isLoading}
                    >
                        Log In
                    </Button>
                </div>

                <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 mb-2">or</p>
                    <Button
                        type="button"
                        variant="outline"
                        isFullWidth
                        onClick={handleDemoLogin}
                        disabled={isSubmitting || isLoading}
                    >
                        Demo Login
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                        Sign up
                    </a>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                    <a href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                        Forgot your password?
                    </a>
                </p>
            </div>
        </Card>
    )
}

export default LoginForm 