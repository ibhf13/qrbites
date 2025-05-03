import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import React, { Suspense } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LoadingSpinner, NotificationSnackbar } from './components/common'
import routes from './config/routes'
import { AuthProvider } from './features/auth'

// Create a reusable loading component
const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
    </div>
)

// Create the router using the routes configuration
const router = createBrowserRouter(routes)

// Create Query Client with better defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SnackbarProvider
                    maxSnack={3}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    autoHideDuration={5000}
                    preventDuplicate
                    Components={{
                        success: NotificationSnackbar,
                        error: NotificationSnackbar,
                        warning: NotificationSnackbar,
                        info: NotificationSnackbar,
                        default: NotificationSnackbar,
                    }}
                >
                    <div className="min-h-screen bg-neutral-50">
                        <Suspense fallback={<PageLoader />}>
                            <RouterProvider router={router} />
                        </Suspense>
                    </div>
                </SnackbarProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App 