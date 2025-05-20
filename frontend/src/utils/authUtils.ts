export const debugAuthState = (): Record<string, unknown> => {
    const localToken = localStorage.getItem('auth_token')
    const sessionToken = sessionStorage.getItem('auth_token')

    const localUser = localStorage.getItem('user')
    const sessionUser = localStorage.getItem('user')
    let localUserObj = null
    let sessionUserObj = null

    try {
        if (localUser) {
            localUserObj = JSON.parse(localUser)
        }
    } catch (error) {
        console.error('Failed to parse localStorage user', error)
    }

    try {
        if (sessionUser) {
            sessionUserObj = JSON.parse(sessionUser)
        }
        } catch (error) {
        console.error('Failed to parse sessionStorage user', error)
    }

    return {
        isAuthenticated: !!(localToken || sessionToken),
        tokenExists: {
            localStorage: !!localToken,
            sessionStorage: !!sessionToken
        },
        tokenDetails: {
            localStorage: localToken ? {
                length: localToken.length,
                prefix: localToken.substring(0, 10) + '...'
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