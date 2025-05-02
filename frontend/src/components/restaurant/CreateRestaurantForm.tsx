import { CreateRestaurantData, restaurantService } from '@api/restaurant'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

// Define schema with Zod
const restaurantSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description cannot exceed 500 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters').max(100, 'Address cannot exceed 100 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone cannot exceed 20 characters'),
    email: z.string().email('Please enter a valid email address'),
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    openingHours: z.string().max(100, 'Opening hours cannot exceed 100 characters').optional().or(z.literal(''))
})

// Infer the type from the schema
type RestaurantFormData = z.infer<typeof restaurantSchema>

interface ApiError {
    response?: {
        data?: {
            error?: string
        }
    }
    message: string
}

const CreateRestaurantForm = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [error, setError] = useState<string | null>(null)

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RestaurantFormData>({
        resolver: zodResolver(restaurantSchema),
        defaultValues: {
            name: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            openingHours: ''
        }
    })

    const createRestaurantMutation = useMutation({
        mutationFn: restaurantService.createRestaurant,
        onSuccess: () => {
            // Invalidate and refetch restaurants
            queryClient.invalidateQueries({ queryKey: ['restaurants'] })
            navigate('/dashboard/restaurants')
        },
        onError: (error: ApiError) => {
            setError(error.response?.data?.error || 'Failed to create restaurant. Please try again.')
        },
    })

    const onSubmit = (data: RestaurantFormData) => {
        setError(null)

        // Handle empty strings for optional fields
        const formattedData: CreateRestaurantData = {
            ...data,
            website: data.website || undefined,
            openingHours: data.openingHours || undefined
        }

        createRestaurantMutation.mutate(formattedData)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Restaurant</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Restaurant Name*
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

                    <div className="col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description*
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

                    <div className="col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address*
                        </label>
                        <input
                            id="address"
                            {...register('address')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone*
                        </label>
                        <input
                            id="phone"
                            {...register('phone')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email*
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                            Website (Optional)
                        </label>
                        <input
                            id="website"
                            type="url"
                            {...register('website')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.website ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="https://example.com"
                        />
                        {errors.website && (
                            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-1">
                            Opening Hours (Optional)
                        </label>
                        <input
                            id="openingHours"
                            {...register('openingHours')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.openingHours ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g. Mon-Fri: 9am-10pm, Sat-Sun: 10am-11pm"
                        />
                        {errors.openingHours && (
                            <p className="mt-1 text-sm text-red-600">{errors.openingHours.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/restaurants')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Restaurant'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateRestaurantForm 