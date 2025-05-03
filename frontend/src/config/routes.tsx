import { ProtectedRoute } from '@/features/auth'
import { lazy } from 'react'
import { Link, RouteObject } from 'react-router-dom'

// Lazy-loaded Pages - using dynamic imports for code splitting
const LoginPage = lazy(() => import('../Pages/LoginPage'))
const RegisterPage = lazy(() => import('../Pages/RegisterPage'))
const NotFoundPage = lazy(() => import('../Pages/NotFoundPage'))
const ProfilePage = lazy(() => import('../Pages/ProfilePage'))
const RestaurantDashboardPage = lazy(() => import('../Pages/RestaurantDashboardPage'))
const DesignSystem = lazy(() => import('../Pages/DesignSystem'))
const DesignSystemDemo = lazy(() => import('../Pages/DesignSystemDemo'))

// Home page as a placeholder for now
const HomePage = () => (
    <div className="p-8 text-center">
        <h1 className="text-3xl font-display font-bold text-primary-700 mb-4">
            QrBites
        </h1>
        <p className="text-neutral-600 mb-6">
            Transform restaurant menus into digital menus with QR codes.
        </p>

        <div className="flex justify-center gap-4">
            <Link
                to="/login"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
            >
                Login
            </Link>
            <Link
                to="/register"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-primary-600 border border-primary-300 rounded-md transition-colors"
            >
                Register
            </Link>
        </div>

        <div className="mt-8">
            <Link
                to="/restaurants"
                className="text-primary-600 hover:text-primary-700 font-medium"
            >
                Manage Your Restaurants →
            </Link>
        </div>
    </div>
)

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
    {
        path: '/design-system',
        element: <DesignSystem />,
    },
    {
        path: '/design-system-demo',
        element: <DesignSystemDemo />,
    },

    // Auth routes - require authentication
    {
        path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
    },
    {
        path: '/restaurants',
        element: <ProtectedRoute><RestaurantDashboardPage /></ProtectedRoute>,
    },

    // 404 route - always keep this last
    {
        path: '*',
        element: <NotFoundPage />,
    },
]

export default routes 