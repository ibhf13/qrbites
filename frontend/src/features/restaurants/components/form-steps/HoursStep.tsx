import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Card, Typography, Checkbox, FlexBox, Box, Grid, FormError } from '@/components/common'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const HoursStep: React.FC = () => {
    const { control, formState: { errors } } = useFormContext()

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
        <Box className="space-y-4">
            <Card variant="outlined" padding="sm" className="bg-white dark:bg-neutral-900">
                <Typography variant="subheading" className="mb-2">
                    Business Hours
                </Typography>

                {/* Display general hours validation error */}
                <FormError errors={getNestedError(errors, 'hours')} />

                <Box className="space-y-4 mt-4">
                    {DAYS.map((dayName, index) => (
                        <Controller
                            key={index}
                            name={`hours.${index}`}
                            control={control}
                            defaultValue={{ day: index, open: '', close: '', closed: false }}
                            render={({ field }) => {
                                const day = field.value || { day: index, open: '', close: '', closed: false }

                                return (
                                    <Card variant="outlined" padding="sm">
                                        <FlexBox direction="col" className="sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                                            <Box className="w-full sm:w-32">
                                                <Typography variant="body" color="neutral">
                                                    {dayName}
                                                </Typography>
                                            </Box>

                                            <Box className="flex-1">
                                                <Box className="mb-3">
                                                    <Checkbox
                                                        id={`closed-${index}`}
                                                        label="Closed"
                                                        checked={day.closed}
                                                        onChange={(e) => {
                                                            field.onChange({
                                                                ...day,
                                                                closed: e.target.checked,
                                                                open: e.target.checked ? '' : day.open,
                                                                close: e.target.checked ? '' : day.close
                                                            })
                                                        }}
                                                    />
                                                </Box>

                                                {!day.closed && (
                                                    <Box>
                                                        <Grid cols={1} colsSm={2} gap="sm">
                                                            <Box>
                                                                <label htmlFor={`open-${index}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                                    Open
                                                                </label>
                                                                <input
                                                                    id={`open-${index}`}
                                                                    type="time"
                                                                    value={day.open || ''}
                                                                    onChange={(e) => {
                                                                        field.onChange({ ...day, open: e.target.value })
                                                                    }}
                                                                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 py-2 px-3 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:ring-primary-500 focus:border-primary-500"
                                                                />
                                                                <FormError errors={getNestedError(errors, `hours.${index}.open`)} />
                                                            </Box>

                                                            <Box>
                                                                <label htmlFor={`close-${index}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                                    Close
                                                                </label>
                                                                <input
                                                                    id={`close-${index}`}
                                                                    type="time"
                                                                    value={day.close || ''}
                                                                    onChange={(e) => {
                                                                        field.onChange({ ...day, close: e.target.value })
                                                                    }}
                                                                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 py-2 px-3 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:ring-primary-500 focus:border-primary-500"
                                                                />
                                                                <FormError errors={getNestedError(errors, `hours.${index}.close`)} />
                                                            </Box>
                                                        </Grid>

                                                        {/* Display validation errors for required open/close times */}
                                                        {(!day.open || !day.close) && !day.closed && (
                                                            <FormError errors="Both open and close times are required when the restaurant is not closed" />
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        </FlexBox>
                                    </Card>
                                )
                            }}
                        />
                    ))}
                </Box>
            </Card>

        </Box>
    )
}

export default HoursStep 