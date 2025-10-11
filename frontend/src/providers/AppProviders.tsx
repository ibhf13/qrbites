import { QUERY_CLIENT_CONFIG, SNACKBAR_CONFIG } from '@/config/app.config'
import { NotificationProvider, NotificationSnackbar } from '@/features/notifications'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/features/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import React, { useMemo } from 'react'
import { ErrorBoundary } from '@/features/errorHandling/components'

interface AppProvidersProps {
    children: React.ReactNode
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    const queryClient = useMemo(
        () => new QueryClient(QUERY_CLIENT_CONFIG),
        []
    )

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <SnackbarProvider
                        {...SNACKBAR_CONFIG}
                        Components={{
                            success: NotificationSnackbar,
                            error: NotificationSnackbar,
                            warning: NotificationSnackbar,
                            info: NotificationSnackbar,
                            default: NotificationSnackbar
                        }}
                        dense
                        domRoot={document.getElementById('root') || undefined}
                    >
                        <NotificationProvider>
                            <AuthProvider>
                                {children}
                            </AuthProvider>
                        </NotificationProvider>
                    </SnackbarProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default AppProviders
