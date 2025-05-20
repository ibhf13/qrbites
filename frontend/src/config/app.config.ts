import { QueryClientConfig } from '@tanstack/react-query'
import { SnackbarProviderProps } from 'notistack'

export const SNACKBAR_CONFIG: Partial<SnackbarProviderProps> = {
    maxSnack: 3,
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'right'
    },
    autoHideDuration: 3000,
    preventDuplicate: true,
    hideIconVariant: false,
    disableWindowBlurListener: false
}

export const QUERY_CLIENT_CONFIG: QueryClientConfig = {
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
} 