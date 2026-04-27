import AppRouter from '@/components/app/AppRouter'
import AppProviders from '@/providers/AppProviders'
import { Analytics } from '@vercel/analytics/react'
import React from 'react'

const App: React.FC = () => {
    return (
        <AppProviders>
            <AppRouter />
            <Analytics />
        </AppProviders>
    )
}

export default App 