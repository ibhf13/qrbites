import { GuestRoute, ProtectedRoute } from '@/features/auth'
import MainLayout from '@/features/layout/MainLayout'
import RestaurantCreationForm from '@/features/restaurants/components/RestaurantCreationForm'
import { lazy } from 'react'
import { Outlet, RouteObject } from 'react-router-dom'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'))
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const NotFoundPage = lazy(() => import('@/features/layout/NotFoundPage'))
const RestaurantsPage = lazy(() => import('@/features/restaurants/pages/RestaurantsPage'))
const MenusPage = lazy(() => import('@/features/menus/pages/MenusPage'))
const PublicMenuPage = lazy(() => import('@/features/viewer/pages/PublicMenuPage'))

export const routes: RouteObject[] = [
    {
        path: '/Home',
        element: <HomePage />,
    },
    {
        path: '/login',
        element: (
            <GuestRoute>
                <LoginPage />
            </GuestRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <GuestRoute>
                <RegisterPage />
            </GuestRoute>
        ),
    },
    {
        path: '/view/menu/:menuId',
        element: <PublicMenuPage />,
    },

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
                path: 'profile',
                element: <ProfilePage />,
            },
            {
                path: '/',
                element: <RestaurantsPage />,
            },
            {
                path: 'restaurants',
                element: <RestaurantsPage />,
            },
            {
                path: 'restaurants/create',
                element: <RestaurantCreationForm />,
            },
            {
                path: 'restaurants/:restaurantId',
                element: <MenusPage />,
            },

        ],
    },

    {
        path: '*',
        element: <NotFoundPage />,
    },
]

export default routes 