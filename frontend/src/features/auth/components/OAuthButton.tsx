import React from 'react'
import { Button, GoogleIcon } from '@/components/common'
import env from '@/config/env'

type OAuthProvider = 'google'

interface OAuthButtonProps {
    provider: OAuthProvider
    disabled?: boolean
}

interface ProviderConfig {
    name: string
    Icon: React.FC<{ className?: string }>
}

const providerConfig: Record<OAuthProvider, ProviderConfig> = {
    google: {
        name: 'Google',
        Icon: GoogleIcon
    }
}

/**
 * OAuth authentication button component
 * 
 * Redirects users to OAuth provider for authentication.
 * Currently supports Google OAuth with extensibility for future providers.
 * 
 * @example
 * ```tsx
 * <OAuthButton provider="google" disabled={isLoading} />
 * ```
 */
const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, disabled = false }) => {
    const config = providerConfig[provider]

    const handleOAuthLogin = () => {
        try {
            const baseUrl = env.apiUrl || ''
            const oauthUrl = `${baseUrl}/api/auth/${provider}`

            if (process.env.NODE_ENV === 'development') {
                console.log(`Redirecting to ${provider} OAuth...`)
            }

            window.location.href = oauthUrl
        } catch (error) {
            console.error('OAuth redirect failed:', error)
        }
    }

    const { Icon } = config

    return (
        <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleOAuthLogin}
            disabled={disabled}
            className="gap-2"
        >
            <Icon className="h-5 w-5" />
            Continue with {config.name}
        </Button>
    )
}

export default OAuthButton

