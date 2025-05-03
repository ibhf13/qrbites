import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import env from '@/config/env'
import { useNotification } from '@/hooks/useNotification'
import { useLogin } from '../hooks/useLogin'
import { LoginFormData } from '../types/auth.types'
import { loginSchema } from '../validations/login.validation'

const LoginForm: React.FC = () => {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotification()
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
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log In</h2>

            {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
                    <span className="font-medium">Error: </span>{serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="input-field mt-1"
                        placeholder="you@example.com"
                        disabled={isSubmitting || isLoading}
                    />
                    {errors.email && (
                        <p className="error-text">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className="input-field mt-1"
                        placeholder="••••••••"
                        disabled={isSubmitting || isLoading}
                    />
                    {errors.password && (
                        <p className="error-text">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        {...register('rememberMe')}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                </div>

                <div>
                    <button
                        type="submit"
                        className="btn-primary w-full flex justify-center"
                        disabled={isSubmitting || isLoading}
                    >
                        {(isSubmitting || isLoading) ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging In...
                            </>
                        ) : 'Log In'}
                    </button>
                </div>

                <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 mb-2">or</p>
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="w-full py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        disabled={isSubmitting || isLoading}
                    >
                        Demo Login
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign up
                    </a>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                    <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        Forgot your password?
                    </a>
                </p>
            </div>
        </div>
    )
}

export default LoginForm 