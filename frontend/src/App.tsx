import AppRouter from '@/components/app/AppRouter'
import AppProviders from '@/providers/AppProviders'
import React from 'react'

const App: React.FC = () => {
    return (
        <AppProviders>
            <AppRouter />
        </AppProviders>
    )
}

export default App 