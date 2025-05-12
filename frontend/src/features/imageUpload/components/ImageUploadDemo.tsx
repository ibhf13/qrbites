import React, { useState } from 'react'
import { ImageType, UploadResponse } from '../types'
import { ImageUploader } from './ImageUploader'

export const ImageUploadDemo: React.FC = () => {
    const [uploadType, setUploadType] = useState<ImageType>('logo')
    const [multiple, setMultiple] = useState(false)
    const [enableCropping, setEnableCropping] = useState(true)
    const [enableCompression, setEnableCompression] = useState(true)
    const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)

    const handleUploadComplete = (response: UploadResponse) => {
        console.log('Upload complete:', response)
        setUploadResponse(response)
    }

    const handleUploadError = (error: Error) => {
        console.error('Upload error:', error)
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Image Upload Demo</h1>

            {/* Configuration controls */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-medium text-gray-700 mb-4">Upload Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image Type
                        </label>
                        <select
                            value={uploadType}
                            onChange={(e) => setUploadType(e.target.value as ImageType)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="logo">Restaurant Logo</option>
                            <option value="menuPhoto">Menu Photo</option>
                        </select>
                    </div>

                    <div className="flex items-center mt-4 md:mt-0">
                        <div className="flex items-start mr-6">
                            <div className="flex items-center h-5">
                                <input
                                    id="multiple"
                                    type="checkbox"
                                    checked={multiple}
                                    onChange={(e) => setMultiple(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-2 text-sm">
                                <label htmlFor="multiple" className="font-medium text-gray-700">
                                    Multiple Files
                                </label>
                            </div>
                        </div>

                        <div className="flex items-start mr-6">
                            <div className="flex items-center h-5">
                                <input
                                    id="cropping"
                                    type="checkbox"
                                    checked={enableCropping}
                                    onChange={(e) => setEnableCropping(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-2 text-sm">
                                <label htmlFor="cropping" className="font-medium text-gray-700">
                                    Enable Cropping
                                </label>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="compression"
                                    type="checkbox"
                                    checked={enableCompression}
                                    onChange={(e) => setEnableCompression(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-2 text-sm">
                                <label htmlFor="compression" className="font-medium text-gray-700">
                                    Enable Compression
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image uploader */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-4">
                    {uploadType === 'logo' ? 'Upload Restaurant Logo' : 'Upload Menu Photos'}
                </h2>

                <ImageUploader
                    type={uploadType}
                    multiple={multiple}
                    enableCropping={enableCropping}
                    enableCompression={enableCompression}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                />
            </div>

            {/* Response display */}
            {uploadResponse && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">Upload Response</h2>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-60">
                        {JSON.stringify(uploadResponse, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
} 