import { useCallback, useState } from 'react'
import { Area } from 'react-easy-crop'
import { CropArea, ImageType } from '../types'
import { blobToFile, cropImage } from '../utils/imageProcessing'
import { getRecommendedDimensions } from '../validations/fileValidations'

interface UseImageCropOptions {
    type: ImageType
    aspectRatio?: number
}

interface CropState {
    cropping: boolean
    error: string | null
    originalFile: File | null
    croppedFile: File | null
    previewUrl: string | null
    crop: { x: number; y: number }
    zoom: number
    cropArea: CropArea | null
}

export const useImageCrop = (options: UseImageCropOptions) => {
    const { type, aspectRatio } = options

    const defaultAspectRatio = useCallback(() => {
        const dimensions = getRecommendedDimensions(type)
        return dimensions.width / dimensions.height
    }, [type])

    const [cropState, setCropState] = useState<CropState>({
        cropping: false,
        error: null,
        originalFile: null,
        croppedFile: null,
        previewUrl: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        cropArea: null,
    })

    const resetCropState = useCallback(() => {
        // Cleanup any object URLs
        if (cropState.previewUrl) {
            URL.revokeObjectURL(cropState.previewUrl)
        }

        setCropState({
            cropping: false,
            error: null,
            originalFile: null,
            croppedFile: null,
            previewUrl: null,
            crop: { x: 0, y: 0 },
            zoom: 1,
            cropArea: null,
        })
    }, [cropState.previewUrl])

    const setCropFile = useCallback((file: File) => {
        // Cleanup previous preview if exists
        if (cropState.previewUrl) {
            URL.revokeObjectURL(cropState.previewUrl)
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)

        setCropState(prev => ({
            ...prev,
            originalFile: file,
            previewUrl,
            crop: { x: 0, y: 0 },
            zoom: 1,
            cropArea: null,
            croppedFile: null,
        }))
    }, [cropState.previewUrl])

    const setCropPosition = useCallback((x: number, y: number) => {
        setCropState(prev => ({
            ...prev,
            crop: { x, y },
        }))
    }, [])

    const setCropZoom = useCallback((zoom: number) => {
        setCropState(prev => ({
            ...prev,
            zoom,
        }))
    }, [])

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCropState(prev => ({
            ...prev,
            cropArea: {
                x: croppedAreaPixels.x,
                y: croppedAreaPixels.y,
                width: croppedAreaPixels.width,
                height: croppedAreaPixels.height,
            },
        }))
    }, [])

    const cropImageFile = useCallback(async (): Promise<File | null> => {
        const { originalFile, previewUrl, cropArea } = cropState

        if (!originalFile || !previewUrl || !cropArea) {
            setCropState(prev => ({
                ...prev,
                error: 'Missing required crop information',
            }))
            return null
        }

        setCropState(prev => ({
            ...prev,
            cropping: true,
            error: null,
        }))

        try {
            // Perform the crop operation
            const croppedBlob = await cropImage(
                previewUrl,
                cropArea,
                originalFile.type,
                0.9
            )

            // Convert blob to file
            const croppedFileName = `cropped-${originalFile.name}`
            const croppedFile = blobToFile(croppedBlob, croppedFileName)

            setCropState(prev => ({
                ...prev,
                cropping: false,
                croppedFile,
            }))

            return croppedFile
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown cropping error'

            setCropState(prev => ({
                ...prev,
                cropping: false,
                error: errorMessage,
            }))

            return null
        }
    }, [cropState])

    return {
        setFile: setCropFile,
        setCropPosition,
        setCropZoom,
        onCropComplete,
        cropImage: cropImageFile,
        reset: resetCropState,
        cropping: cropState.cropping,
        error: cropState.error,
        originalFile: cropState.originalFile,
        croppedFile: cropState.croppedFile,
        previewUrl: cropState.previewUrl,
        crop: cropState.crop,
        zoom: cropState.zoom,
        cropArea: cropState.cropArea,
        aspectRatio: aspectRatio || defaultAspectRatio(),
    }
} 