export interface UploadedFile {
    originalName: string
    filename: string
    size: number
    url: string
    thumbnailUrl?: string
}

export interface UploadResponse {
    success: boolean
    data: {
        files: UploadedFile[]
    }
}

export interface ImageUploadOptions {
    maxSize: number
    acceptedFileTypes: string[]
    multiple?: boolean
    fieldName: string
    compressionOptions?: CompressionOptions
}

export interface CompressionOptions {
    maxSizeMB: number
    maxWidthOrHeight?: number
    useWebWorker?: boolean
    fileType?: string
}

export interface CropArea {
    x: number
    y: number
    width: number
    height: number
}

export type ImageType = 'logo' | 'menuPhoto'

export interface UploadProgressEvent {
    loaded: number
    total: number
    percentage: number
}

export interface UploadConfig {
    type: ImageType
    file: File
    onProgress?: (progress: UploadProgressEvent) => void
    onSuccess?: (response: UploadResponse) => void
    onError?: (error: Error) => void
    onCancel?: () => void
} 