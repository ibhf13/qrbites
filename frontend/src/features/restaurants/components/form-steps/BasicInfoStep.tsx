import React from 'react'
import { useFormContext } from 'react-hook-form'
import FormInput from '../../../../components/common/forms/FormInput'

const BasicInfoStep: React.FC = () => {
    const { register, formState: { errors } } = useFormContext()

    // Helper function to safely access nested error messages
    const getNestedError = (obj: any, path: string): string => {
        if (!obj) return ''
        const keys = path.split('.')
        let current = obj

        for (const key of keys) {
            if (!current[key]) return ''
            current = current[key]
        }

        return current.message || ''
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Restaurant Information</h2>

            {/* Restaurant Name */}
            <FormInput
                label="Restaurant Name*"
                {...register('name')}
                error={getNestedError(errors, 'name')}
                helperText="Enter the full name of your restaurant"
            />

            {/* Restaurant Description */}
            <div>
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your restaurant..."
                />
                {errors.description?.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Brief description of your restaurant (max 500 characters)</p>
            </div>

            {/* Restaurant Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active Restaurant
                </label>
            </div>
            <p className="text-sm text-gray-500">
                When inactive, your restaurant will not be visible to customers
            </p>

            <div className="border-b border-gray-200 pb-6"></div>

            <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>

            {/* Phone */}
            <FormInput
                label="Phone Number"
                {...register('contact.phone')}
                error={getNestedError(errors, 'contact.phone')}
                helperText="Must start with + followed by 1-14 digits, e.g. +49123456789"
                placeholder="+49123456789"
            />

            {/* Email */}
            <FormInput
                label="Email Address"
                type="email"
                {...register('contact.email')}
                error={getNestedError(errors, 'contact.email')}
                placeholder="restaurant@example.com"
            />

            {/* Website */}
            <FormInput
                label="Website"
                {...register('contact.website')}
                error={getNestedError(errors, 'contact.website')}
                helperText="Format: https://example.com"
                placeholder="https://example.com"
            />

            <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-100">
                <p className="text-sm text-yellow-800">
                    <span className="font-medium">Important:</span> Phone numbers must be in international format starting with a + symbol (e.g., +49123456789)
                </p>
            </div>
        </div>
    )
}

export default BasicInfoStep 