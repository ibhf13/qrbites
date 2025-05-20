import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, Typography, FormInput, FlexBox, Box, Grid } from '@/components/common'

const LocationStep: React.FC = () => {
    const { register, formState: { errors } } = useFormContext()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <Card variant="soft" padding="lg">
                <Typography variant="title" gutterBottom>
                    Restaurant Location
                </Typography>
                <Typography variant="body" color="muted" gutterBottom className="mb-8">
                    Provide the complete address where your restaurant is located. This information will help customers find your restaurant.
                </Typography>

                <Box className="space-y-8">
                    <Grid cols={1} colsMd={3} gap="lg">
                        <Box className="md:col-span-2">
                            <FormInput
                                label="Street Name*"
                                {...register('location.street')}
                                error={getNestedError(errors, 'location.street')}
                                placeholder="Main Street"
                            />
                        </Box>
                        <Box>
                            <FormInput
                                label="House Number*"
                                {...register('location.houseNumber')}
                                error={getNestedError(errors, 'location.houseNumber')}
                                placeholder="123"
                            />
                        </Box>
                    </Grid>

                    <Grid cols={1} colsMd={2} gap="lg">
                        <FormInput
                            label="City*"
                            {...register('location.city')}
                            error={getNestedError(errors, 'location.city')}
                            placeholder="Enter city name"
                        />

                        <FormInput
                            label="Zip/Postal Code*"
                            {...register('location.zipCode')}
                            error={getNestedError(errors, 'location.zipCode')}
                            placeholder="12345"
                            helperText="Format: 5 digits (e.g., 12345)"
                        />
                    </Grid>
                </Box>
            </Card>

            <Card variant="outlined" padding="lg" className="bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
                <FlexBox align="start" gap="md">
                    <Box className="flex-shrink-0">
                        <svg className="h-6 w-6 text-info-500 dark:text-info-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </Box>
                    <Box>
                        <Typography variant="body" className="text-info-800 dark:text-info-200">
                            <span className="font-semibold">Note:</span> The address will be used to help customers locate your restaurant and may be displayed on your public menu page.
                        </Typography>
                    </Box>
                </FlexBox>
            </Card>
        </FlexBox>
    )
}

export default LocationStep 