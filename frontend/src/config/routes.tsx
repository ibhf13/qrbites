import { Dashboard } from '@/components/app'
import MainLayout from '@/components/common/layout/MainLayout'
import { ProtectedRoute } from '@/features/auth'
import { RestaurantCreationForm } from '@/features/restaurants/components'
import { lazy } from 'react'
import { Outlet, RouteObject } from 'react-router-dom'

// Lazy-loaded Pages - using dynamic imports for code splitting
const HomePage = lazy(() => import('@/Pages/HomePage'))
const LoginPage = lazy(() => import('@/Pages/LoginPage'))
const RegisterPage = lazy(() => import('@/Pages/RegisterPage'))
const NotFoundPage = lazy(() => import('@/Pages/NotFoundPage'))
const ProfilePage = lazy(() => import('@/Pages/ProfilePage'))
const RestaurantEditPage = lazy(() => import('@/Pages/RestaurantEditPage'))
const RestaurantListPage = lazy(() => import('@/Pages/RestaurantListPage'))

/**
 * Application routes configuration
 * Routes are organized by access level:
 * - public: accessible to all users
 * - auth: require authentication
 * - admin: require admin privileges
 */
export const routes: RouteObject[] = [
    // Public routes
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },

    // Auth routes - require authentication
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout>
                    <Outlet />
                </MainLayout>
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'profile',
                element: <ProfilePage />,
            },
            {
                path: 'restaurants',
                element: <RestaurantListPage />,
            },
            {
                path: 'restaurants/create',
                element: <RestaurantCreationForm />,
            },
            {
                path: 'restaurants/:id/edit',
                element: <RestaurantEditPage />,
            },
        ],
    },

    // 404 route - always keep this last
    {
        path: '*',
        element: <NotFoundPage />,
    },
]

export default routes 