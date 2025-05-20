import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, Typography, Checkbox, FormInput, Textarea, FlexBox, Box, Grid } from '@/components/common'

const BasicInfoStep: React.FC = () => {
    const { register, formState: { errors } } = useFormContext()


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
        <FlexBox direction="col" gap="lg">
            <Grid cols={1} colsLg={2} gap="lg">
                <Card variant="soft" padding="lg" className="h-fit">
                    <Typography variant="title" gutterBottom>
                        Restaurant Information
                    </Typography>

                    <Box className="space-y-6">
                        <FormInput
                            label="Restaurant Name*"
                            {...register('name')}
                            error={getNestedError(errors, 'name')}
                            helperText="Enter the full name of your restaurant"
                        />

                        <Textarea
                            label="Description"
                            {...register('description')}
                            rows={5}
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

                <Card variant="soft" padding="lg" className="h-fit">
                    <Typography variant="title" gutterBottom>
                        Contact Information
                    </Typography>

                    <Box className="space-y-6">
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

            <Card variant="outlined" padding="lg" className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
                <FlexBox align="start" gap="md">
                    <Box className="flex-shrink-0">
                        <svg className="h-6 w-6 text-warning-500 dark:text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </Box>
                    <Box>
                        <Typography variant="body" className="text-warning-800 dark:text-warning-200">
                            <span className="font-semibold">Important:</span> Phone numbers must be in international format starting with a + symbol (e.g., +49123456789)
                        </Typography>
                    </Box>
                </FlexBox>
            </Card>
        </FlexBox>
    )
}

export default BasicInfoStep 