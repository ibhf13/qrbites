import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios'
import { ImageType, UploadConfig, UploadResponse } from '../types'

// Map of active uploads to their cancel tokens
const activeUploads: Map<string, CancelTokenSource> = new Map()

const API_BASE_URL = '/api'

const getUploadEndpoint = (type: ImageType): string => {
    switch (type) {
        case 'logo':
            return `${API_BASE_URL}/restaurants/logo`
        case 'menuPhoto':
            return `${API_BASE_URL}/restaurants/menu-photos`
        default:
            throw new Error(`Unsupported image type: ${type}`)
    }
}

const getFormFieldName = (type: ImageType): string => {
    switch (type) {
        case 'logo':
            return 'logo'
        case 'menuPhoto':
            return 'photos'
        default:
            throw new Error(`Unsupported image type: ${type}`)
    }
}

export const uploadImage = async (config: UploadConfig): Promise<UploadResponse> => {
    const { type, file, onProgress, onSuccess, onError, onCancel } = config

    // Create a unique ID for this upload
    const uploadId = `${type}_${file.name}_${Date.now()}`

    // Create form data
    const formData = new FormData()
    formData.append(getFormFieldName(type), file)

    // Create cancel token
    const source = axios.CancelToken.source()
    activeUploads.set(uploadId, source)

    try {
        // Set up request config with progress tracking
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            cancelToken: source.token,
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percentage,
                    })
                }
            },
        }

        // Make the request
        const response = await axios.post<UploadResponse>(
            getUploadEndpoint(type),
            formData,
            requestConfig
        )

        // Clean up
        activeUploads.delete(uploadId)

        // Handle success
        if (onSuccess) {
            onSuccess(response.data)
        }

        return response.data
    } catch (error) {
        // Clean up
        activeUploads.delete(uploadId)

        // Handle cancellation
        if (axios.isCancel(error)) {
            if (onCancel) {
                onCancel()
            }
            throw new Error('Upload cancelled')
        }

        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during upload'

        if (onError) {
            onError(new Error(errorMessage))
        }

        throw new Error(errorMessage)
    }
}

export const cancelUpload = (uploadId: string): boolean => {
    const source = activeUploads.get(uploadId)

    if (source) {
        source.cancel('Upload cancelled by user')
        activeUploads.delete(uploadId)
        return true
    }

    return false
}

export const getActiveUploads = (): string[] => {
    return Array.from(activeUploads.keys())
} 