import React, { useState, useEffect } from 'react'
import { Button } from '@/components/common/buttons/Button'
import { Typography, Box, FlexBox } from '@/components/common'
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <FlexBox direction="col" gap="md" className="w-full">
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
            </FlexBox>
            <FlexBox direction="col" gap="md">
                <Box className="space-y-4">
                    <Typography variant="caption" color="neutral" className="block text-sm font-medium">
                        Menu Image
                    </Typography>
                    <FileDropzone
                        onFileSelect={handleFileSelect}
                        accept={{
                            'image/jpeg': [],
                            'image/png': [],
                            'image/webp': []
                        }}
                        multiple={false}
                        maxSize={5 * 1024 * 1024}
                        helpText="Maximum 5MB. Supported formats: JPEG, PNG, WebP"
                        initialPreview={existingImageUrl || undefined}
                        showPreview={true}
                    />
                </Box>
                <Checkbox
                    label="Active Menu"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                />
            </FlexBox>

            <FlexBox justify="end" className="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    size="md"
                >
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting} size="md">
                    {isSubmitting
                        ? (mode === 'create' ? 'Creating...' : 'Updating...')
                        : (mode === 'create' ? 'Create Menu' : 'Update Menu')
                    }
                </Button>
            </FlexBox>
        </form>
    )
} 