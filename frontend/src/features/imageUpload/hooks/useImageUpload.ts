import { useCallback, useState } from 'react'
import { cancelUpload, uploadImage } from '../api'
import { ImageType, UploadProgressEvent, UploadResponse } from '../types'
import { getFileValidationError } from '../validations/fileValidations'

interface UseImageUploadOptions {
    type: ImageType
    onSuccess?: (response: UploadResponse) => void
    onError?: (error: Error) => void
}

interface UploadState {
    uploading: boolean
    progress: UploadProgressEvent | null
    error: string | null
    uploadId: string | null
    response: UploadResponse | null
}

export const useImageUpload = (options: UseImageUploadOptions) => {
    const { type, onSuccess, onError } = options

    const [uploadState, setUploadState] = useState<UploadState>({
        uploading: false,
        progress: null,
        error: null,
        uploadId: null,
        response: null,
    })

    const resetUploadState = useCallback(() => {
        setUploadState({
            uploading: false,
            progress: null,
            error: null,
            uploadId: null,
            response: null,
        })
    }, [])

    const handleUpload = useCallback(
        async (file: File) => {
            // Validate file before upload
            const validationError = getFileValidationError(file, type)

            if (validationError) {
                setUploadState(prev => ({
                    ...prev,
                    error: validationError,
                }))

                if (onError) {
                    onError(new Error(validationError))
                }

                return
            }

            // Create upload ID
            const uploadId = `${type}_${file.name}_${Date.now()}`

            // Set initial state
            setUploadState({
                uploading: true,
                progress: { loaded: 0, total: 100, percentage: 0 },
                error: null,
                uploadId,
                response: null,
            })

            try {
                // Start upload
                const response = await uploadImage({
                    type,
                    file,
                    onProgress: (progress) => {
                        setUploadState(prev => ({
                            ...prev,
                            progress,
                        }))
                    },
                    onCancel: () => {
                        setUploadState(prev => ({
                            ...prev,
                            uploading: false,
                            error: 'Upload cancelled',
                        }))
                    },
                })

                // Handle success
                setUploadState({
                    uploading: false,
                    progress: { loaded: 100, total: 100, percentage: 100 },
                    error: null,
                    uploadId: null,
                    response,
                })

                if (onSuccess) {
                    onSuccess(response)
                }

                return response
            } catch (error) {
                // Handle error
                const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'

                setUploadState(prev => ({
                    ...prev,
                    uploading: false,
                    error: errorMessage,
                }))

                if (onError) {
                    onError(error instanceof Error ? error : new Error(errorMessage))
                }
            }
        },
        [type, onSuccess, onError]
    )

    const cancelCurrentUpload = useCallback(() => {
        if (uploadState.uploadId) {
            cancelUpload(uploadState.uploadId)
            return true
        }
        return false
    }, [uploadState.uploadId])

    return {
        upload: handleUpload,
        cancel: cancelCurrentUpload,
        reset: resetUploadState,
        uploading: uploadState.uploading,
        progress: uploadState.progress,
        error: uploadState.error,
        response: uploadState.response,
    }
} 