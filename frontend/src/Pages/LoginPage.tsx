import React from 'react'
import { LoginForm } from '../features/auth'

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-gray-900">QrBites</h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Transform your restaurant menus into digital experiences
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}

export default LoginPage 