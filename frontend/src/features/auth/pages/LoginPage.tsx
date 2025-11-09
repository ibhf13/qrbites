import { Button, Checkbox, FormInput, Typography, FlexBox } from '@/components/common'
import env from '@/config/env'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLoginAction } from '../hooks/useAuthActions'
import { LoginFormData } from '../types/auth.types'
import { loginSchema } from '../validations/login.validation'
import AuthCard from '../components/AuthCard'
import AuthLayout from '../components/AuthLayout'
import OAuthButton from '../components/OAuthButton'

const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isLoading, error, clearError } = useLoginAction()

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
            rememberMe: false,
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        clearError()
        const result = await login(data)

        if (result.success) {
            const from = (location.state)?.from || '/'

            navigate(from, { replace: true })
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

    const oauthContent = (
        <OAuthButton provider="google" disabled={isSubmitting || isLoading} />
    )

    const footerContent = (
        <FlexBox direction="col" gap="sm">
            <Typography variant="body" color="muted" align="center">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                    Sign up
                </Link>
            </Typography>
            <Typography variant="body" color="muted" align="center">
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
        <AuthLayout>
            <AuthCard title="Log In" error={error} oauthContent={oauthContent} footerContent={footerContent}>
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

                    <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={handleDemoLogin}
                        disabled={isSubmitting || isLoading}
                    >
                        Demo Login
                    </Button>
                </form>
            </AuthCard>
        </AuthLayout>

    )
}

export default LoginPage
