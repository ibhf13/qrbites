import React from 'react'
import { useFormContext } from 'react-hook-form'
import FormInput from '../../../../components/common/forms/FormInput'

const LocationStep: React.FC = () => {
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
            <h2 className="text-xl font-semibold text-gray-800">Restaurant Location</h2>

            {/* Address */}
            <FormInput
                label="Street Address*"
                {...register('location.address')}
                error={getNestedError(errors, 'location.address')}
                placeholder="123 Main St"
            />

            {/* City */}
            <FormInput
                label="City*"
                {...register('location.city')}
                error={getNestedError(errors, 'location.city')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State */}
                <FormInput
                    label="State/Province*"
                    {...register('location.state')}
                    error={getNestedError(errors, 'location.state')}
                />

                {/* Zip Code */}
                <FormInput
                    label="Zip/Postal Code*"
                    {...register('location.zipCode')}
                    error={getNestedError(errors, 'location.zipCode')}
                    placeholder="12345"
                    helperText="Format: 12345 or 12345-6789"
                />
            </div>

            {/* Country */}
            <FormInput
                label="Country*"
                {...register('location.country')}
                error={getNestedError(errors, 'location.country')}
            />

            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-sm text-blue-800">
                    <span className="font-medium">Note:</span> The address will be used to help customers locate your restaurant.
                </p>
            </div>
        </div>
    )
}

export default LocationStep 