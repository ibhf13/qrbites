import routes from '@/config/routes'
import React, { Suspense } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import PageLoader from './PageLoader'

const AppRouter: React.FC = () => {
    const router = createBrowserRouter(routes)

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Suspense fallback={<PageLoader />}>
                <RouterProvider router={router} />
            </Suspense>
        </div>
    )
}

export default AppRouter 