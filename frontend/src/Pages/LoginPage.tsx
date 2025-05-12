import React from 'react'
import { AuthLayout, LoginForm } from '../features/auth'

const LoginPage: React.FC = () => {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    )
}

export default LoginPage 