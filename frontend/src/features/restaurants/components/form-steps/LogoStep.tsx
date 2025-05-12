import React from 'react'
import { useDropzone } from 'react-dropzone'

interface LogoStepProps {
    onLogoChange: (file: File | null) => void
    existingLogoUrl?: string | null
}

const LogoStep: React.FC<LogoStepProps> = ({ onLogoChange, existingLogoUrl }) => {
    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onLogoChange(acceptedFiles[0])
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/gif': [],
            'image/webp': []
        },
        maxSize: 2 * 1024 * 1024, // 2MB
        multiple: false
    })

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Restaurant Logo</h2>
            <p className="text-gray-600">
                Upload a logo for your restaurant. This will be displayed on your restaurant page and menu.
            </p>

            {existingLogoUrl && (
                <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-2">Current logo:</p>
                    <div className="flex items-center">
                        <img
                            src={existingLogoUrl}
                            alt="Restaurant Logo"
                            className="h-20 w-20 object-cover rounded-full border border-gray-300"
                        />
                        <p className="ml-4 text-sm text-gray-500">
                            Upload a new logo below to replace this one
                        </p>
                    </div>
                </div>
            )}

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition duration-150 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="mt-2 flex text-sm text-gray-600 justify-center">
                        <label className="relative font-medium text-indigo-600 hover:text-indigo-500">
                            <span>Upload a file</span>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Logo: max 2MB, recommended 512x512px
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-sm text-gray-700">
                    <span className="font-medium">Tip:</span> Upload a square logo image for best results. The logo will be displayed
                    as a circular image on your restaurant page.
                </p>
            </div>
        </div>
    )
}

export default LogoStep 