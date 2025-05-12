import { useCallback, useState } from 'react'
import { CompressionOptions, ImageType } from '../types'
import { compressImage } from '../utils/imageProcessing'
import { getMaxFileSize } from '../validations/fileValidations'

interface UseImageCompressionOptions {
    type: ImageType
    maxWidthOrHeight?: number
    quality?: number
}

interface CompressionState {
    compressing: boolean
    error: string | null
    originalFile: File | null
    compressedFile: File | null
    compressionRatio: number | null
}

export const useImageCompression = (options: UseImageCompressionOptions) => {
    const { type, maxWidthOrHeight, quality = 0.8 } = options

    const [compressionState, setCompressionState] = useState<CompressionState>({
        compressing: false,
        error: null,
        originalFile: null,
        compressedFile: null,
        compressionRatio: null,
    })

    const resetCompressionState = useCallback(() => {
        setCompressionState({
            compressing: false,
            error: null,
            originalFile: null,
            compressedFile: null,
            compressionRatio: null,
        })
    }, [])

    const compressFile = useCallback(
        async (file: File): Promise<File> => {
            setCompressionState({
                compressing: true,
                error: null,
                originalFile: file,
                compressedFile: null,
                compressionRatio: null,
            })

            try {
                // Create compression options
                const compressionOptions: CompressionOptions = {
                    maxSizeMB: getMaxFileSize(type) / (1024 * 1024),
                    maxWidthOrHeight: maxWidthOrHeight ||
                        (type === 'logo' ? 512 : 1200),
                    useWebWorker: true,
                    fileType: file.type,
                }

                // Compress image
                const compressedFile = await compressImage(file, compressionOptions)

                // Calculate compression ratio
                const compressionRatio = file.size > 0
                    ? (1 - (compressedFile.size / file.size)) * 100
                    : 0

                setCompressionState({
                    compressing: false,
                    error: null,
                    originalFile: file,
                    compressedFile,
                    compressionRatio,
                })

                return compressedFile
            } catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Unknown compression error'

                setCompressionState(prev => ({
                    ...prev,
                    compressing: false,
                    error: errorMessage,
                }))

                throw error
            }
        },
        [type, maxWidthOrHeight]
    )

    return {
        compress: compressFile,
        reset: resetCompressionState,
        compressing: compressionState.compressing,
        error: compressionState.error,
        originalFile: compressionState.originalFile,
        compressedFile: compressionState.compressedFile,
        compressionRatio: compressionState.compressionRatio,
    }
} 