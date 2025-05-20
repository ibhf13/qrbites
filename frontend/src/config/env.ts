// @ts-nocheck
/**
 * Environment configuration
 * This file centralizes access to environment variables and provides defaults.
 */

const env = {
    apiUrl: import.meta.env.VITE_API_URL,
    demoEmail: import.meta.env.VITE_DEMO_EMAIL,
    demoPassword: import.meta.env.VITE_DEMO_PASSWORD,
}

export default env 