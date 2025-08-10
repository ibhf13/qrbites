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
        <FlexBox direction="col" gap="md">
            <Card variant="outlined" padding="sm" className="bg-white dark:bg-neutral-900">
                <Typography variant="subheading" className="mb-2">
                    Restaurant Location
                </Typography>

                <Box className="space-y-4">
                    <Grid cols={1} colsMd={3} gap="md">
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

                    <Grid cols={1} colsMd={2} gap="md">
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
        </FlexBox>
    )
}

export default LocationStep 