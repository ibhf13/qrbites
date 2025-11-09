import routes from '@/config/routes/routes'
import React, { Suspense } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LoadingSpinner, Box } from '../common'

const AppRouter: React.FC = () => {
    const router = createBrowserRouter(routes)

    return (
        <Box className="min-h-screen bg-neutral-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Suspense fallback={<LoadingSpinner label="Loading" subtitle="Please wait..." />}>
                <RouterProvider router={router} />
            </Suspense>
        </Box>
    )
}

export default AppRouter 