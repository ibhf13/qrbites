import { Button, Checkbox, FormInput, Typography, Box, FlexBox } from '@/components/common'
import env from '@/config/env'
import { useNotificationActions } from '@/features/notifications'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginAction } from '../hooks/useAuthActions'
import { LoginFormData } from '../types/auth.types'
import { loginSchema } from '../validations/login.validation'
import AuthCard from './AuthCard'

const LoginForm: React.FC = () => {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState<string | null>(null)
    const { showSuccess } = useNotificationActions()
    const { login, isLoading, error, clearError } = useLoginAction()

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

        const result = await login(data)

        if (result.success) {
            showSuccess('Login successful!')
            navigate('/')
            reset()
        }
    }

    const handleDemoLogin = () => {
        setValue('email', env.demoEmail)
        setValue('password', env.demoPassword)
        setValue('rememberMe', true)

        const demoCredentials: LoginFormData = {
            email: env.demoEmail,
            password: env.demoPassword,
            rememberMe: true
        }

        onSubmit(demoCredentials)
    }

    const footerContent = (
        <FlexBox direction="col" gap="sm">
            <Typography variant="body2" color="muted" align="center">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                    Sign up
                </Link>
            </Typography>
            <Typography variant="body2" color="muted" align="center">
                <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                    Forgot your password?
                </Link>
            </Typography>
        </FlexBox>
    )

    return (
        <AuthCard
            title="Log In"
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
                    autoComplete="current-password"
                    disabled={isSubmitting || isLoading}
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Checkbox
                    id="rememberMe"
                    label="Remember me"
                    {...register('rememberMe')}
                />

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isSubmitting || isLoading}
                    disabled={isSubmitting || isLoading}
                >
                    Log In
                </Button>

                <Box pt="sm">
                    <FlexBox direction="col" align="center" gap="sm">
                        <Typography variant="body2" color="muted" align="center">
                            or
                        </Typography>
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={handleDemoLogin}
                            disabled={isSubmitting || isLoading}
                        >
                            Demo Login
                        </Button>
                    </FlexBox>
                </Box>
            </form>
        </AuthCard>
    )
}

export default LoginForm 