import React, { useCallback, useEffect, useState } from 'react'
import { useImageCompression, useImageCrop, useImageUpload } from '../hooks'
import { ImageType, UploadResponse } from '../types'
import { createImagePreview, releaseObjectUrl } from '../utils/imageProcessing'
import { getMaxFileSize, getRecommendedDimensions } from '../validations/fileValidations'
import { DropZone } from './DropZone'
import { ImageCropper } from './ImageCropper'
import { ImagePreview } from './ImagePreview'
import { ProgressIndicator } from './ProgressIndicator'

interface ImageUploaderProps {
    type: ImageType
    multiple?: boolean
    aspectRatio?: number
    onUploadComplete?: (response: UploadResponse) => void
    onUploadError?: (error: Error) => void
    enableCropping?: boolean
    enableCompression?: boolean
    className?: string
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    type,
    multiple = false,
    aspectRatio,
    onUploadComplete,
    onUploadError,
    enableCropping = true,
    enableCompression = true,
    className = '',
}) => {
    // State for selected files and previews
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'cropping' | 'compressing' | 'uploading' | 'complete' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Get default aspect ratio if none provided
    const defaultAspectRatio = useCallback(() => {
        const dimensions = getRecommendedDimensions(type)
        return dimensions.width / dimensions.height
    }, [type])

    // Initialize hooks
    const {
        upload,
        cancel: cancelUpload,
        uploading,
        progress,
        error: uploadError,
        response,
        reset: resetUpload,
    } = useImageUpload({
        type,
        onSuccess: onUploadComplete,
        onError: onUploadError,
    })

    const {
        compress,
        compressing,
        error: compressionError,
        reset: resetCompression,
    } = useImageCompression({ type })

    const {
        setFile: setCropFile,
        setCropPosition,
        setCropZoom,
        onCropComplete,
        cropImage,
        cropping,
        error: cropError,
        previewUrl: cropPreviewUrl,
        crop,
        zoom,
        reset: resetCrop,
    } = useImageCrop({
        type,
        aspectRatio: aspectRatio || defaultAspectRatio(),
    })

    // Reset state when component unmounts
    useEffect(() => {
        return () => {
            // Clear any object URLs to prevent memory leaks
            previews.forEach(preview => {
                releaseObjectUrl(preview)
            })

            if (cropPreviewUrl) {
                releaseObjectUrl(cropPreviewUrl)
            }

            resetUpload()
            resetCompression()
            resetCrop()
        }
    }, [previews, cropPreviewUrl, resetUpload, resetCompression, resetCrop])

    // Handle files selection
    const handleFilesSelected = useCallback(
        (files: File[]) => {
            // Clear previous state
            setErrorMessage(null)
            setUploadStatus('idle')

            // Create previews for selected files
            const newPreviews = files.map(file => createImagePreview(file))

            // Update state
            setSelectedFiles(files)
            setPreviews(newPreviews)

            // If cropping is enabled, start with the first file
            if (enableCropping && files.length > 0) {
                setCurrentFileIndex(0)
                setCropFile(files[0])
                setUploadStatus('cropping')
            } else if (files.length > 0) {
                // If no cropping, proceed to compression or upload
                processNextFile(0, files)
            }
        },
        [enableCropping, setCropFile]
    )

    // Process file (compress and/or upload)
    const processNextFile = useCallback(
        async (index: number, filesArray = selectedFiles) => {
            if (index >= filesArray.length) {
                // All files processed
                setUploadStatus('complete')
                return
            }

            let fileToProcess = filesArray[index]

            try {
                // Compress file if enabled
                if (enableCompression) {
                    setUploadStatus('compressing')
                    fileToProcess = await compress(fileToProcess)
                }

                // Upload file
                setUploadStatus('uploading')
                await upload(fileToProcess)

                // Move to next file if there are more
                if (index < filesArray.length - 1) {
                    processNextFile(index + 1, filesArray)
                } else {
                    setUploadStatus('complete')
                }
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Error processing file')
                setUploadStatus('error')
            }
        },
        [selectedFiles, enableCompression, compress, upload]
    )

    // Handle crop completion
    const handleCropComplete = useCallback(async () => {
        if (currentFileIndex < 0 || currentFileIndex >= selectedFiles.length) {
            return
        }

        try {
            const croppedFile = await cropImage()

            if (croppedFile) {
                // Replace the original file with the cropped one
                const newFiles = [...selectedFiles]
                newFiles[currentFileIndex] = croppedFile
                setSelectedFiles(newFiles)

                // Move to next file if there are more to crop
                if (multiple && currentFileIndex < selectedFiles.length - 1) {
                    setCurrentFileIndex(currentFileIndex + 1)
                    setCropFile(selectedFiles[currentFileIndex + 1])
                } else {
                    // All files cropped, proceed to compression/upload
                    setUploadStatus('idle')
                    processNextFile(0, newFiles)
                }
            }
        } catch (error) {
            setErrorMessage('Failed to crop image')
            setUploadStatus('error')
        }
    }, [currentFileIndex, selectedFiles, cropImage, multiple, setCropFile, processNextFile])

    // Handle cancel upload
    const handleCancelUpload = useCallback(() => {
        cancelUpload()
        setUploadStatus('idle')
        setErrorMessage(null)
    }, [cancelUpload])

    // Handle removing a selected file
    const handleRemoveFile = useCallback(
        (index: number) => {
            // Remove file and preview
            const newFiles = [...selectedFiles]
            const newPreviews = [...previews]

            // Release object URL
            releaseObjectUrl(newPreviews[index])

            newFiles.splice(index, 1)
            newPreviews.splice(index, 1)

            setSelectedFiles(newFiles)
            setPreviews(newPreviews)

            // Reset state if no files left
            if (newFiles.length === 0) {
                setUploadStatus('idle')
                setErrorMessage(null)
                resetUpload()
                resetCompression()
                resetCrop()
            }
        },
        [selectedFiles, previews, resetUpload, resetCompression, resetCrop]
    )

    // Reset everything
    const handleReset = useCallback(() => {
        // Clear previews to avoid memory leaks
        previews.forEach(preview => {
            releaseObjectUrl(preview)
        })

        setSelectedFiles([])
        setPreviews([])
        setCurrentFileIndex(-1)
        setUploadStatus('idle')
        setErrorMessage(null)
        resetUpload()
        resetCompression()
        resetCrop()
    }, [previews, resetUpload, resetCompression, resetCrop])

    return (
        <div className={`space-y-4 ${className}`}>
            {/* File upload area */}
            {selectedFiles.length === 0 && (
                <DropZone
                    onFilesAccepted={handleFilesSelected}
                    maxSize={getMaxFileSize(type)}
                    type={type}
                    multiple={multiple}
                    disabled={uploadStatus !== 'idle'}
                />
            )}

            {/* Image cropper (shown during cropping phase) */}
            {uploadStatus === 'cropping' && cropPreviewUrl && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">Crop Image</h3>
                    <ImageCropper
                        imageSrc={cropPreviewUrl}
                        onCropComplete={onCropComplete}
                        aspectRatio={aspectRatio || defaultAspectRatio()}
                        initialCrop={crop}
                        initialZoom={zoom}
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCropComplete}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
                            disabled={cropping}
                        >
                            {cropping ? 'Processing...' : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            )}

            {/* Preview area (shown after selection) */}
            {selectedFiles.length > 0 && uploadStatus !== 'cropping' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">Selected Images</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {previews.map((preview, index) => (
                            <ImagePreview
                                key={`${selectedFiles[index].name}-${index}`}
                                src={preview}
                                filename={selectedFiles[index].name}
                                size={selectedFiles[index].size}
                                onRemove={() => handleRemoveFile(index)}
                                className="aspect-w-1 aspect-h-1"
                            />
                        ))}
                    </div>

                    {/* Processing status and controls */}
                    {(uploadStatus === 'compressing' || uploadStatus === 'uploading') && (
                        <div className="mt-4">
                            <ProgressIndicator
                                percentage={progress?.percentage || 0}
                                showCancel={true}
                                onCancel={handleCancelUpload}
                                status={uploadStatus === 'compressing' ? 'processing' : 'uploading'}
                            />
                        </div>
                    )}

                    {/* Success message */}
                    {uploadStatus === 'complete' && (
                        <div className="p-4 rounded-md bg-green-50 mt-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-green-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Upload complete!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {(errorMessage || uploadError || compressionError || cropError) && (
                        <div className="p-4 rounded-md bg-red-50 mt-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">
                                        {errorMessage || uploadError || compressionError || cropError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {uploadStatus !== 'compressing' && uploadStatus !== 'uploading' && (
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                            >
                                Reset
                            </button>
                            {uploadStatus === 'idle' && (
                                <button
                                    type="button"
                                    onClick={() => processNextFile(0)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
                                    disabled={selectedFiles.length === 0}
                                >
                                    Upload
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 