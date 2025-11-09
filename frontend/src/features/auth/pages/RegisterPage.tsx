import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button, FormInput, Typography } from '@/components/common'
import { useRegisterAction } from '../hooks/useAuthActions'
import { RegisterFormData } from '../types/auth.types'
import { registerSchema } from '../validations/register.validation'
import AuthCard from '../components/AuthCard'
import AuthLayout from '../components/AuthLayout'
import OAuthButton from '../components/OAuthButton'

const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const { register: registerUser, isLoading, error, clearError } = useRegisterAction()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            name: ''
        }
    })

    const onSubmit = async (data: RegisterFormData) => {
        clearError()
        const result = await registerUser(data)

        if (result.success) {
            navigate('/login')
            reset()
        }
    }

    const oauthContent = (
        <OAuthButton provider="google" disabled={isSubmitting || isLoading} />
    )

    const footerContent = (
        <Typography variant="body" color="muted" align="center">
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
        <AuthLayout>
            <AuthCard title="Create an Account" error={error} oauthContent={oauthContent} footerContent={footerContent}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormInput
                        label="Full Name"
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isSubmitting || isLoading}
                        error={errors.name?.message}
                        {...register('name')}
                    />

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
        </AuthLayout>

    )
}

export default RegisterPage
