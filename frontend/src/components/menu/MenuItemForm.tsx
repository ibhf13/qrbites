import { CreateMenuItemData, MenuItem, menuService } from '@api/menu'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

// Define schema with Zod
const menuItemSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
    description: z.string().max(200, 'Description cannot exceed 200 characters').optional().or(z.literal('')),
    price: z.string().refine(val => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0
    }, { message: 'Price must be a positive number' }),
    category: z.string().optional().or(z.literal('')),
    isAvailable: z.boolean().default(true)
})

// Only accept image files
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Infer the type from the schema
type MenuItemFormData = z.infer<typeof menuItemSchema> & {
    image?: FileList
}

interface ApiError {
    response?: {
        data?: {
            error?: string
        }
    }
    message: string
}

interface MenuItemFormProps {
    menuId: string
    categories: string[]
    onSuccess?: (menuItem: MenuItem) => void
    existingItem?: MenuItem // For editing
}

const MenuItemForm = ({ menuId, categories = [], onSuccess, existingItem }: MenuItemFormProps) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [error, setError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(existingItem?.image || null)

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch
    } = useForm<MenuItemFormData>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: existingItem ? {
            name: existingItem.name,
            description: existingItem.description || '',
            price: existingItem.price.toString(),
            category: existingItem.category || '',
            isAvailable: existingItem.isAvailable
        } : {
            name: '',
            description: '',
            price: '',
            category: categories.length > 0 ? categories[0] : '',
            isAvailable: true
        }
    })

    // Watch for file input changes to show preview
    const imageFile = watch('image')

    useEffect(() => {
        if (imageFile?.[0]) {
            const file = imageFile[0]
            if (ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                // Reset the file input if invalid
                setImagePreview(null)
            }
        }
    }, [imageFile])

    const createMenuItemMutation = useMutation({
        mutationFn: menuService.createMenuItem,
        onSuccess: (response) => {
            // Invalidate and refetch menu items
            queryClient.invalidateQueries({ queryKey: ['menuItems', menuId] })

            if (onSuccess) {
                onSuccess(response.data)
            } else {
                // Navigate to menu items list
                navigate(`/dashboard/menus/${menuId}/items`)
            }

            // Reset form
            reset()
            setImagePreview(null)
        },
        onError: (error: ApiError) => {
            setError(error.response?.data?.error || 'Failed to create menu item. Please try again.')
        }
    })

    const onSubmit = (data: MenuItemFormData) => {
        setError(null)

        const menuItemData: CreateMenuItemData = {
            name: data.name,
            description: data.description || undefined,
            price: parseFloat(data.price),
            category: data.category || undefined,
            isAvailable: data.isAvailable,
            menuId,
            image: data.image?.[0]
        }

        createMenuItemMutation.mutate(menuItemData)
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name*
                        </label>
                        <input
                            id="name"
                            {...register('name')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price*
                        </label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('price')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            rows={2}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {categories.length > 0 && (
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category (Optional)
                            </label>
                            <select
                                id="category"
                                {...register('category')}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <div className="flex items-center mb-2">
                            <input
                                id="isAvailable"
                                type="checkbox"
                                {...register('isAvailable')}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                                Item is available
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">
                            Uncheck if this item is temporarily unavailable
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Image (Optional)
                        </label>
                        <div className="mt-1 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="image"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    {...register('image')}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {imagePreview && (
                                <div className="w-full md:w-1/3">
                                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null)
                                            reset({ ...watch(), image: undefined })
                                        }}
                                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/dashboard/menus/${menuId}/items`)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : existingItem ? 'Update Item' : 'Add Item'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default MenuItemForm 