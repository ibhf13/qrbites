import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Restaurant, RestaurantFormData } from '../types/restaurant.types'
import { BaseRestaurantForm } from './BaseRestaurantForm'

interface RestaurantEditFormProps {
    restaurant: Restaurant
    onClose: () => void
}

const RestaurantEditForm: React.FC<RestaurantEditFormProps> = ({ restaurant, onClose }) => {
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const handleSubmit = async (data: RestaurantFormData) => {
        setSubmitError(null)
        try {
            const formData = new FormData()

            // Add form fields
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'contact' || key === 'location') {
                    Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
                        if (subValue) {
                            formData.append(`${key}[${subKey}]`, subValue)
                        }
                    })
                } else if (key === 'hours') {
                    (value as Array<{ day: number; open?: string; close?: string; closed: boolean }>).forEach((hour, index) => {
                        formData.append(`hours[${index}][day]`, hour.day.toString())
                        formData.append(`hours[${index}][closed]`, hour.closed.toString())
                        if (!hour.closed) {
                            if (hour.open) formData.append(`hours[${index}][open]`, hour.open)
                            if (hour.close) formData.append(`hours[${index}][close]`, hour.close)
                        }
                    })
                } else if (value && key !== 'logo') {
                    formData.append(key, value.toString())
                }
            })

            // Add logo if available
            if (data.logo instanceof File) {
                formData.append('logo', data.logo)
            }

            const token = localStorage.getItem('auth_token')
            const baseUrl = import.meta.env.VITE_API_URL || ''
            const response = await fetch(`${baseUrl}/api/restaurants/${restaurant._id}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `Server returned ${response.status}`)
            }

            const responseData = await response.json()
            if (responseData.success) {
                onClose()
                // Refresh the page to show updated data
                window.location.reload()
            } else {
                throw new Error(responseData.error || 'Unknown server error')
            }
        } catch (error) {
            console.error('Error updating restaurant:', error)
            setSubmitError(error instanceof Error ? error.message : 'Failed to update restaurant')
            throw error // Re-throw to let the form handle the error state
        }
    }

    // Transform restaurant data to match form data type
    const formData: Partial<RestaurantFormData> = {
        name: restaurant.name,
        description: restaurant.description,
        contact: restaurant.contact,
        location: restaurant.location,
        hours: restaurant.hours,
        isActive: restaurant.isActive
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {submitError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {submitError}
                </div>
            )}
            <BaseRestaurantForm
                mode="edit"
                initialData={{ ...formData, id: restaurant._id }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default RestaurantEditForm 