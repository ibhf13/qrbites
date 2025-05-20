import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Card, Typography, Checkbox, FlexBox, Box, Grid } from '@/components/common'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const HoursStep: React.FC = () => {
    const { control } = useFormContext()

    return (
        <Box className="space-y-6">
            <Card variant="soft" padding="lg">
                <Typography variant="h4" gutterBottom>
                    Business Hours
                </Typography>
                <Typography variant="body2" color="muted" gutterBottom>
                    Set your restaurant's operating hours. Check "Closed" if the restaurant is closed on a particular day.
                </Typography>

                <Box className="space-y-4 mt-6">
                    {DAYS.map((dayName, index) => (
                        <Controller
                            key={index}
                            name={`hours.${index}`}
                            control={control}
                            defaultValue={{ day: index, open: '', close: '', closed: false }}
                            render={({ field }) => {
                                const day = field.value || { day: index, open: '', close: '', closed: false }

                                return (
                                    <Card variant="outlined" padding="md">
                                        <FlexBox direction="col" className="sm:flex-row sm:items-center space-y-3 sm:space-y-0">
                                            <Box className="w-32">
                                                <Typography variant="subtitle2" color="default">
                                                    {dayName}
                                                </Typography>
                                            </Box>

                                            <Box className="flex-1">
                                                <Box className="mb-4">
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
                                                    <Grid cols={1} colsSm={2} gap="md">
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
                                                        </Box>
                                                    </Grid>
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

            <Card variant="outlined" padding="md" className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
                <FlexBox align="start" gap="sm">
                    <Box className="flex-shrink-0">
                        <svg className="h-5 w-5 text-warning-500 dark:text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="default" className="text-warning-800 dark:text-warning-200">
                            <span className="font-semibold">Tip:</span> Having accurate business hours helps customers know when they can visit your restaurant.
                        </Typography>
                    </Box>
                </FlexBox>
            </Card>
        </Box>
    )
}

export default HoursStep 