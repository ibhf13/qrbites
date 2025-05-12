import React from 'react'
import { AuthLayout, RegisterForm } from '../features/auth'

const RegisterPage: React.FC = () => {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    )
}

export default RegisterPage 