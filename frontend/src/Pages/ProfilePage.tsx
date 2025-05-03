import { AvatarUpload, PasswordChangeForm, ProfileForm, useProfileData } from '@/features/profile'
import { debugAuthState } from '@/utils/authUtils'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ProfilePage: React.FC = () => {
    const { profileData, isLoading, isError, error } = useProfileData()
    const navigate = useNavigate()
    const [showDebug, setShowDebug] = useState(false)
    const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null)

    // Debug function - instead of redirecting, show current auth state
    const checkAuthState = () => {
        const authState = debugAuthState()
        setDebugInfo(authState)
        setShowDebug(true)
        console.log('Auth state:', authState) // Log for easier debugging
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (isError) {
        // Check if error is auth-related
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const isAuthError = typeof error === 'object' && error !== null &&
            ('message' in error && typeof error.message === 'string' &&
                (error.message.includes('token') || error.message.includes('auth') || error.message.includes('unauthorized')))

        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 max-w-3xl mx-auto my-8">
                <h2 className="text-lg font-medium">Error loading profile</h2>
                {isAuthError ? (
                    <div>
                        <p>You are not authorized to view this page. Please log in first.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md"
                        >
                            Go to Login
                        </button>
                        <button
                            onClick={checkAuthState}
                            className="mt-4 ml-2 px-4 py-2 bg-gray-600 text-white rounded-md"
                        >
                            Debug Auth
                        </button>

                        {showDebug && debugInfo && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-md text-black">
                                <h3 className="font-medium">Authentication Debug Info:</h3>
                                <pre className="mt-2 text-xs overflow-auto max-h-60">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Unable to load your profile information. Please try refreshing the page. {errorMessage}</p>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
                    <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:space-x-8">
                        <div className="md:w-1/3 mb-6 md:mb-0">
                            <h3 className="text-md font-medium text-gray-900 mb-2">Profile Photo</h3>
                            <AvatarUpload />
                        </div>
                        <div className="md:w-2/3">
                            <h3 className="text-md font-medium text-gray-900 mb-4">Personal Information</h3>
                            <ProfileForm
                                initialData={profileData?.profile}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your password</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <PasswordChangeForm />
                </div>
            </div>

            {/* Debug button for diagnosing auth issues */}
            <div className="mt-8 text-right">
                <button
                    onClick={checkAuthState}
                    className="text-xs text-gray-500 hover:text-primary-600"
                >
                    Debug Auth
                </button>

                {showDebug && debugInfo && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md text-left">
                        <h3 className="font-medium">Authentication Debug Info:</h3>
                        <pre className="mt-2 text-xs overflow-auto max-h-60">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage 