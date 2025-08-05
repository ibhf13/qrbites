import React, { useState, useEffect } from 'react'
import { Button } from '@/components/common/buttons/Button'
import { Card, Typography, Box, FlexBox } from '@/components/common'
import Checkbox from '@/components/common/forms/Checkbox'
import FileDropzone from '@/components/common/forms/FileDropzone'
import Input from '@/components/common/forms/Input'
import TextArea from '@/components/common/forms/TextArea'
import { useMenuForm } from '../hooks/useMenuForm'
import { MenuFormData } from '../types/menu.types'

interface MenuFormProps {
    initialData?: Partial<MenuFormData>
    onCancel: () => void
    mode?: 'create' | 'edit'
    restaurantId?: string
    menuId?: string
    existingImageUrl?: string | null
}

export const MenuForm: React.FC<MenuFormProps> = ({
    initialData,
    onCancel,
    mode = 'create',
    restaurantId,
    menuId,
    existingImageUrl
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const {
        formData,
        errors,
        isSubmitting,
        handleSubmit,
        handleInputChange,
        handleFileChange
    } = useMenuForm({
        restaurantId,
        initialData,
        mode,
        menuId,
        onSuccess: onCancel
    })

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]

            handleFileChange(files)

            const url = URL.createObjectURL(file)

            setPreviewUrl(url)
        }
    }

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Box className="grid grid-cols-1 gap-4">
                <Input
                    label="Menu Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="Enter menu name"
                    required
                />

                <TextArea
                    label="Description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    error={errors.description}
                    placeholder="Enter menu description (optional)"
                    rows={3}
                />

                {mode === 'create' && (
                    <Input
                        label="Restaurant ID"
                        name="restaurantId"
                        value={formData.restaurantId}
                        onChange={handleInputChange}
                        error={errors.restaurantId}
                        placeholder="Enter restaurant ID"
                        required
                    />
                )}

                <Box className="space-y-4">
                    <Typography variant="body" color="neutral" className="block text-sm font-medium">
                        Menu Image
                    </Typography>

                    {(existingImageUrl || previewUrl) && (
                        <Card variant="outlined" padding="md" className="mb-4">
                            <Typography variant="subheading" color="neutral" gutterBottom>
                                {previewUrl ? 'New image preview:' : 'Current image:'}
                            </Typography>
                            <FlexBox align="center" className="space-x-4">
                                <img
                                    src={previewUrl || existingImageUrl || ''}
                                    alt="Menu preview"
                                    className="h-32 w-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                                />
                                <Typography variant="caption" color="muted">
                                    {previewUrl ? 'This image will be uploaded when you save' : 'Upload a new image below to replace this one'}
                                </Typography>
                            </FlexBox>
                        </Card>
                    )}

                    <FileDropzone
                        title="Menu Image"
                        subtitle="Upload your menu image"
                        onFileSelect={handleFileSelect}
                        accept={{
                            'image/jpeg': [],
                            'image/png': [],
                            'image/webp': []
                        }}
                        multiple={false}
                        maxSize={5 * 1024 * 1024}
                        helpText="Maximum 5MB. Supported formats: JPEG, PNG, WebP"
                    />
                </Box>

                <Checkbox
                    label="Active Menu"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                />
            </Box>

            <FlexBox justify="end" className="gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting
                        ? (mode === 'create' ? 'Creating...' : 'Updating...')
                        : (mode === 'create' ? 'Create Menu' : 'Update Menu')
                    }
                </Button>
            </FlexBox>
        </form>
    )
} 