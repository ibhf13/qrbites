import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const HoursStep: React.FC = () => {
    const { control, watch } = useFormContext()
    const hours = watch('hours') || []

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Business Hours</h2>
            <p className="text-gray-600 mb-4">
                Set your restaurant's operating hours. Check "Closed" if the restaurant is closed on a particular day.
            </p>

            <div className="space-y-4">
                {DAYS.map((dayName, index) => (
                    <Controller
                        key={index}
                        name={`hours.${index}`}
                        control={control}
                        render={({ field }) => {
                            const day = field.value || { day: index, open: '', close: '', closed: false }

                            return (
                                <div className="flex flex-col sm:flex-row sm:items-center p-4 border rounded-lg">
                                    <div className="w-32 font-medium text-gray-700">{dayName}</div>

                                    <div className="flex-1 mt-2 sm:mt-0">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`closed-${index}`}
                                                checked={day.closed}
                                                onChange={(e) => {
                                                    field.onChange({
                                                        ...day,
                                                        closed: e.target.checked,
                                                        open: e.target.checked ? '' : day.open,
                                                        close: e.target.checked ? '' : day.close
                                                    })
                                                }}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`closed-${index}`} className="ml-2 text-gray-700">
                                                Closed
                                            </label>
                                        </div>

                                        {!day.closed && (
                                            <div className="flex flex-col sm:flex-row sm:items-center mt-3 space-y-2 sm:space-y-0 sm:space-x-4">
                                                <div>
                                                    <label htmlFor={`open-${index}`} className="block text-sm text-gray-600">
                                                        Open
                                                    </label>
                                                    <input
                                                        id={`open-${index}`}
                                                        type="time"
                                                        value={day.open || ''}
                                                        onChange={(e) => {
                                                            field.onChange({ ...day, open: e.target.value })
                                                        }}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`close-${index}`} className="block text-sm text-gray-600">
                                                        Close
                                                    </label>
                                                    <input
                                                        id={`close-${index}`}
                                                        type="time"
                                                        value={day.close || ''}
                                                        onChange={(e) => {
                                                            field.onChange({ ...day, close: e.target.value })
                                                        }}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }}
                    />
                ))}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-100">
                <p className="text-sm text-yellow-800">
                    <span className="font-medium">Tip:</span> Having accurate business hours helps customers know when they can visit your restaurant.
                </p>
            </div>
        </div>
    )
}

export default HoursStep 