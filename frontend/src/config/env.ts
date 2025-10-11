// @ts-nocheck

const env = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    demoEmail: import.meta.env.VITE_DEMO_EMAIL,
    demoPassword: import.meta.env.VITE_DEMO_PASSWORD,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV
}

export default env 