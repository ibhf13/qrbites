/**
 * Debug utility to check the state of authentication
 * Helps diagnose issues with the authentication token
 */
export const debugAuthState = (): Record<string, unknown> => {
    // Get tokens from storage
    const localToken = localStorage.getItem('auth_token')
    const sessionToken = sessionStorage.getItem('auth_token')

    // Get user data from storage
    const localUser = localStorage.getItem('user')
    const sessionUser = localStorage.getItem('user')

    // Parse user objects if they exist
    let localUserObj = null
    let sessionUserObj = null

    try {
        if (localUser) {
            localUserObj = JSON.parse(localUser)
        }
    } catch (e) {
        console.error('Failed to parse localStorage user')
    }

    try {
        if (sessionUser) {
            sessionUserObj = JSON.parse(sessionUser)
        }
    } catch (e) {
        console.error('Failed to parse sessionStorage user')
    }

    // Construct debug data object
    return {
        isAuthenticated: !!(localToken || sessionToken),
        tokenExists: {
            localStorage: !!localToken,
            sessionStorage: !!sessionToken
        },
        tokenDetails: {
            localStorage: localToken ? {
                length: localToken.length,
                prefix: localToken.substring(0, 10) + '...' // Show just the beginning of the token
            } : null,
            sessionStorage: sessionToken ? {
                length: sessionToken.length,
                prefix: sessionToken.substring(0, 10) + '...'
            } : null
        },
        userExists: {
            localStorage: !!localUser,
            sessionStorage: !!sessionUser
        },
        userDetails: {
            localStorage: localUserObj,
            sessionStorage: sessionUserObj
        }
    }
} 