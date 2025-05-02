import { authService } from '@api/auth'
import { Menu, MenuResponse, menuService } from '@api/menu'
import CreateMenuForm from '@components/menu/CreateMenuForm'
import MenuItemForm from '@components/menu/MenuItemForm'
import MenuList from '@components/menu/MenuList'
import CreateRestaurantForm from '@components/restaurant/CreateRestaurantForm'
import RestaurantList from '@components/restaurant/RestaurantList'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'

// Placeholder components for dashboard sections
const Overview = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">
                Welcome to QrBites! This dashboard allows you to manage your restaurants, menus, and menu items.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <h3 className="text-lg font-medium text-primary-800 mb-2">Restaurants</h3>
                    <p className="text-gray-600 mb-4">Add and manage your restaurants</p>
                    <Link
                        to="/dashboard/restaurants"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View Restaurants →
                    </Link>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <h3 className="text-lg font-medium text-primary-800 mb-2">Menus</h3>
                    <p className="text-gray-600 mb-4">Create digital menus and generate QR codes</p>
                    <Link
                        to="/dashboard/restaurants"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Select Restaurant →
                    </Link>
                </div>
            </div>
        </div>
    </div>
)

// Menu Items placeholder component
const MenuItems = () => <div className="p-4">Menu Items (Coming Soon)</div>

// Create a wrapper for MenuItemForm to handle menu data fetching
const MenuItemPage = () => {
    const { menuId } = useParams<{ menuId: string }>()

    const { data, isLoading } = useQuery<MenuResponse>({
        queryKey: ['menu', menuId],
        queryFn: async () => {
            if (!menuId) {
                return { success: false, data: {} as Menu }
            }
            return menuService.getMenu(menuId)
        },
        enabled: !!menuId
    })

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </div>
        )
    }

    if (!menuId || !data?.success) {
        return (
            <div className="p-6">
                <div className="bg-red-50 p-4 rounded-md mb-6 text-red-600">
                    Menu not found or invalid menu ID.
                </div>
                <button
                    onClick={() => window.history.back()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Go Back
                </button>
            </div>
        )
    }

    const menu = data.data
    const categories = menu.categories || []

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Menu Item</h1>
            <MenuItemForm menuId={menuId} categories={categories} />
        </div>
    )
}

const Dashboard = () => {
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        authService.logout()
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-primary-800 text-white">
                    <div className="px-4 py-6 text-2xl font-bold">QrBites</div>
                    <div className="flex flex-col flex-1">
                        <nav className="flex-1 px-2 py-4 space-y-2">
                            <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-primary-700">
                                Dashboard
                            </Link>
                            <Link to="/dashboard/restaurants" className="block px-4 py-2 rounded hover:bg-primary-700">
                                Restaurants
                            </Link>
                        </nav>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm bg-primary-700 rounded hover:bg-primary-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden bg-primary-800 text-white p-4 flex justify-between items-center w-full">
                <h1 className="text-xl font-bold">QrBites</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md hover:bg-primary-700"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-primary-800 text-white">
                    <nav className="px-2 pt-2 pb-4 space-y-1">
                        <Link
                            to="/dashboard"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/dashboard/restaurants"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Restaurants
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout()
                                setIsMobileMenuOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            )}

            {/* Content area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/restaurants" element={<RestaurantList />} />
                        <Route path="/restaurants/new" element={<CreateRestaurantForm />} />
                        <Route path="/menus" element={<MenuList />} />
                        <Route path="/menus/new" element={<CreateMenuForm />} />
                        <Route path="/menus/:menuId/items" element={<MenuItems />} />
                        <Route path="/menus/:menuId/items/new" element={<MenuItemPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default Dashboard 