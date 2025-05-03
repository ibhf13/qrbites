// @ts-nocheck
/**
 * Environment configuration
 * This file centralizes access to environment variables and provides defaults.
 */

const env = {
    // API URLs
    apiUrl: import.meta.env.VITE_API_URL,

    // Demo credentials
    demoEmail: import.meta.env.VITE_DEMO_EMAIL,
    demoPassword: import.meta.env.VITE_DEMO_PASSWORD,
}

export default env 