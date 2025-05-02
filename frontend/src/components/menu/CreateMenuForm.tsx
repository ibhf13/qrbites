import { CreateMenuData, menuService } from '@api/menu'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

// Define schema with Zod
const menuSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
    categories: z.array(
        z.object({
            name: z.string().min(1, 'Category name is required')
        })
    ),
    restaurantId: z.string().min(1, 'Restaurant ID is required')
})

// Infer the type from the schema
type MenuFormData = z.infer<typeof menuSchema>

interface ApiError {
    response?: {
        data?: {
            error?: string
        }
    }
    message: string
}

const CreateMenuForm = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const restaurantId = queryParams.get('restaurantId') || ''

    const queryClient = useQueryClient()
    const [error, setError] = useState<string | null>(null)

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<MenuFormData>({
        resolver: zodResolver(menuSchema),
        defaultValues: {
            name: '',
            description: '',
            categories: [{ name: '' }],
            restaurantId
        }
    })

    // Field array for dynamic categories
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'categories'
    })

    const createMenuMutation = useMutation({
        mutationFn: menuService.createMenu,
        onSuccess: () => {
            // Invalidate and refetch menus for this restaurant
            queryClient.invalidateQueries({ queryKey: ['menus', restaurantId] })
            navigate(`/dashboard/menus?restaurantId=${restaurantId}`)
        },
        onError: (error: ApiError) => {
            setError(error.response?.data?.error || 'Failed to create menu. Please try again.')
        }
    })

    const onSubmit = (data: MenuFormData) => {
        setError(null)

        // Filter out empty categories
        const filteredCategories = data.categories
            .filter(cat => cat.name.trim() !== '')
            .map(cat => cat.name.trim())

        // Format data for API
        const menuData: CreateMenuData = {
            name: data.name,
            description: data.description || undefined,
            categories: filteredCategories.length > 0 ? filteredCategories : undefined,
            restaurantId: data.restaurantId
        }

        createMenuMutation.mutate(menuData)
    }

    // If no restaurantId is provided, show an error
    if (!restaurantId) {
        return (
            <div className="p-6">
                <div className="bg-red-50 p-4 rounded-md mb-6 text-red-600">
                    No restaurant selected. Please go back and select a restaurant.
                </div>
                <button
                    onClick={() => navigate('/dashboard/restaurants')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Back to Restaurants
                </button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Menu</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Hidden field for restaurantId */}
                <input type="hidden" {...register('restaurantId')} />

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Menu Name*
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
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Menu Categories (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={() => append({ name: '' })}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                + Add Category
                            </button>
                        </div>

                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <Controller
                                        name={`categories.${index}.name`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder="e.g. Appetizers, Main Course, Desserts"
                                                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.categories?.[index]?.name ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        )}
                                    />
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {errors.categories && (
                                <p className="mt-1 text-sm text-red-600">
                                    {Array.isArray(errors.categories)
                                        ? errors.categories.map((err, i) => err?.name?.message ? `Category ${i + 1}: ${err.name.message}` : null).filter(Boolean).join(', ')
                                        : errors.categories.message}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Categories help organize your menu items. You can add, edit, or remove categories later.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/dashboard/menus?restaurantId=${restaurantId}`)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Menu'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateMenuForm 