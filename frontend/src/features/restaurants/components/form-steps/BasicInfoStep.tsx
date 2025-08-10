import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, Typography, Checkbox, FormInput, Textarea, FlexBox, Box, Grid } from '@/components/common'

const BasicInfoStep: React.FC = () => {
    const { register, formState: { errors } } = useFormContext()

    // eslint-disable-next-line
    const getNestedError = (obj: Record<string, any>, path: string): string => {
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
        <FlexBox direction="col" gap="md">
            <Grid cols={1} colsLg={2} gap="md">
                <Card variant="outlined" padding="sm" className="bg-white dark:bg-neutral-900">
                    <Typography variant="subheading" className="mb-2">
                        Restaurant Information
                    </Typography>

                    <Box className="space-y-4">
                        <FormInput
                            label="Restaurant Name*"
                            {...register('name')}
                            error={getNestedError(errors, 'name')}
                            helperText="Enter the full name of your restaurant"
                        />

                        <Textarea
                            label="Description"
                            {...register('description')}
                            rows={4}
                            placeholder="Describe your restaurant..."
                            error={getNestedError(errors, 'description')}
                        />
                        <Typography variant="caption" color="muted">
                            Brief description of your restaurant (max 500 characters)
                        </Typography>

                        <Box className="space-y-2">
                            <Checkbox
                                id="isActive"
                                label="Active Restaurant"
                                {...register('isActive')}
                            />
                            <Typography variant="caption" color="muted">
                                When inactive, your restaurant will not be visible to customers
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                <Card variant="outlined" padding="sm" className="bg-white dark:bg-neutral-900">
                    <Typography variant="subheading" className="mb-2">
                        Contact Information
                    </Typography>

                    <Box className="space-y-4">
                        <FormInput
                            label="Phone Number"
                            {...register('contact.phone')}
                            error={getNestedError(errors, 'contact.phone')}
                            helperText="Must start with + followed by 1-14 digits, e.g. +49123456789"
                            placeholder="+49123456789"
                        />

                        <FormInput
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            {...register('contact.email')}
                            error={getNestedError(errors, 'contact.email')}
                            placeholder="restaurant@example.com"
                        />

                        <FormInput
                            label="Website"
                            {...register('contact.website')}
                            error={getNestedError(errors, 'contact.website')}
                            helperText="Format: https://example.com"
                            placeholder="https://example.com"
                        />
                    </Box>
                </Card>
            </Grid>
        </FlexBox>
    )
}

export default BasicInfoStep 