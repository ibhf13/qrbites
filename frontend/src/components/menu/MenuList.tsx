import { Menu, menuService } from '@api/menu'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const MenuList = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const restaurantId = queryParams.get('restaurantId')

    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
    const [qrModalOpen, setQrModalOpen] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [isLoadingQr, setIsLoadingQr] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['menus', restaurantId],
        queryFn: () => {
            if (!restaurantId) {
                return { success: true, data: [] }
            }
            return menuService.getMenus(restaurantId)
        },
        enabled: !!restaurantId
    })

    const menus = data?.data || []

    const handleGenerateQrCode = async (menu: Menu) => {
        setSelectedMenu(menu)
        setIsLoadingQr(true)
        setError(null)

        try {
            // If menu already has a QR code, use it
            if (menu.qrCodeUrl) {
                setQrCodeUrl(menu.qrCodeUrl)
            } else {
                // Generate new QR code
                const response = await menuService.getMenuQrCode(menu._id)
                setQrCodeUrl(response.data.qrCodeUrl)
            }
            setQrModalOpen(true)
        } catch (error) {
            console.error('Error generating QR code:', error)
            setError('Failed to generate QR code. Please try again.')
        } finally {
            setIsLoadingQr(false)
        }
    }

    const closeModal = () => {
        setQrModalOpen(false)
        setQrCodeUrl(null)
        setSelectedMenu(null)
    }

    if (!restaurantId) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 p-4 rounded-md mb-6 text-yellow-700">
                    Please select a restaurant to view its menus.
                </div>
                <button
                    onClick={() => navigate('/dashboard/restaurants')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Go to Restaurants
                </button>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Menus</h1>
                <Link
                    to={`/dashboard/menus/new?restaurantId=${restaurantId}`}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Create Menu
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            {menus.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-600 mb-4">No menus yet</h3>
                    <p className="text-gray-500 mb-6">Create your first menu to get started</p>
                    <Link
                        to={`/dashboard/menus/new?restaurantId=${restaurantId}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        Create Your First Menu
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                        <div
                            key={menu._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-semibold text-gray-800">{menu.name}</h2>
                                    <span className={`px-2 py-1 text-xs rounded-full ${menu.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {menu.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">{menu.description || 'No description'}</p>

                                {menu.categories.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Categories</h3>
                                        <div className="flex flex-wrap gap-1">
                                            {menu.categories.map((category, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-between">
                                <button
                                    onClick={() => handleGenerateQrCode(menu)}
                                    disabled={isLoadingQr && selectedMenu?._id === menu._id}
                                    className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                                >
                                    {isLoadingQr && selectedMenu?._id === menu._id
                                        ? 'Generating...'
                                        : 'Generate QR Code'}
                                </button>
                                <Link
                                    to={`/dashboard/menus/${menu._id}/items`}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Manage Items
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {qrModalOpen && selectedMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                            <h3 className="text-xl font-bold text-gray-800">Menu QR Code</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col items-center">
                            <h4 className="text-lg font-medium mb-4">{selectedMenu.name}</h4>

                            {isLoadingQr ? (
                                <div className="flex justify-center items-center h-48 w-48">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                                </div>
                            ) : qrCodeUrl ? (
                                <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                                    <img
                                        src={qrCodeUrl}
                                        alt={`QR Code for ${selectedMenu.name}`}
                                        className="h-48 w-48 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="text-red-600 mb-4">
                                    Failed to load QR code. Please try again.
                                </div>
                            )}

                            <p className="text-sm text-gray-600 text-center mt-2 mb-4">
                                Scan this QR code to view the digital menu.
                            </p>

                            {qrCodeUrl && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            // Download QR code
                                            const link = document.createElement('a')
                                            link.href = qrCodeUrl
                                            link.download = `${selectedMenu.name.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`
                                            document.body.appendChild(link)
                                            link.click()
                                            document.body.removeChild(link)
                                        }}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Print QR code
                                            const printWindow = window.open('', '_blank')
                                            printWindow?.document.write(`
                                                <html>
                                                    <head><title>${selectedMenu.name} QR Code</title></head>
                                                    <body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;">
                                                        <h2 style="margin-bottom:20px;font-family:sans-serif;">${selectedMenu.name}</h2>
                                                        <img src="${qrCodeUrl}" style="max-width:300px;border:1px solid #eee;padding:10px;"/>
                                                    </body>
                                                </html>
                                            `)
                                            printWindow?.document.close()
                                            printWindow?.print()
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                    >
                                        Print
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MenuList 