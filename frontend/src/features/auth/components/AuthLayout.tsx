import React from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title = 'QrBites',
    subtitle = 'Transform your restaurant menus into digital experiences'
}) => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-gray-900">{title}</h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {subtitle}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout 