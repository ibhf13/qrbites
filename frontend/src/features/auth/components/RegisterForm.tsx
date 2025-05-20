import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Button, FormInput, Typography } from '@/components/common'
import { useNotificationActions } from '@/features/notifications'
import { useRegisterAction } from '../hooks/useAuthActions'
import { RegisterFormData } from '../types/auth.types'
import { registerSchema } from '../validations/register.validation'
import AuthCard from './AuthCard'

const RegisterForm: React.FC = () => {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState<string | null>(null)
    const { showSuccess } = useNotificationActions()
    const { register: registerUser, isLoading, error, clearError } = useRegisterAction()

    useEffect(() => {
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

        const result = await registerUser(data)

        if (result.success) {
            showSuccess('Registration successful! You can now log in.')
            navigate('/login')
            reset()
        }
    }

    const footerContent = (
        <Typography as="p" variant="body" color="muted" align="center">
            Already have an account?{' '}
            <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
                Log in
            </Link>
        </Typography>
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
                    autoComplete="email"
                    disabled={isSubmitting || isLoading}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <FormInput
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isSubmitting || isLoading}
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isSubmitting || isLoading}
                    disabled={isSubmitting || isLoading}
                >
                    Register
                </Button>
            </form>
        </AuthCard>
    )
}

export default RegisterForm 