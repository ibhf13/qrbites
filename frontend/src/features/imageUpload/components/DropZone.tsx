import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageType } from '../types'
import { getAcceptedFileTypesString } from '../validations/fileValidations'

interface DropZoneProps {
    onFilesAccepted: (files: File[]) => void
    maxSize: number
    type: ImageType
    multiple?: boolean
    className?: string
    disabled?: boolean
    children?: React.ReactNode
}

export const DropZone: React.FC<DropZoneProps> = ({
    onFilesAccepted,
    maxSize,
    type,
    multiple = false,
    className = '',
    disabled = false,
    children,
}) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFilesAccepted(acceptedFiles)
            }
        },
        [onFilesAccepted]
    )

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        onDrop,
        accept: {
            'image/*': getAcceptedFileTypesString().split(','),
        },
        maxSize,
        multiple,
        disabled,
    })

    // Determine styling based on drag state
    const getBorderColor = () => {
        if (isDragAccept) {
            return 'border-green-500'
        }
        if (isDragReject) {
            return 'border-red-500'
        }
        if (isDragActive) {
            return 'border-blue-500'
        }
        return 'border-gray-300'
    }

    return (
        <div
            {...getRootProps({
                className: `border-2 border-dashed rounded-lg p-6 cursor-pointer transition duration-150 ${getBorderColor()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${className}`,
            })}
        >
            <input {...getInputProps()} />
            {children || (
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
                        <label
                            htmlFor="file-upload"
                            className="relative font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            <span>Upload a file</span>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {type === 'logo'
                            ? 'Logo: max 2MB, recommended 512x512px'
                            : 'Menu photos: max 5MB, recommended 1200x900px'}
                    </p>
                    <p className="text-xs text-gray-500">
                        Accepted formats: JPG, JPEG, PNG, WEBP
                    </p>
                </div>
            )}
        </div>
    )
} 