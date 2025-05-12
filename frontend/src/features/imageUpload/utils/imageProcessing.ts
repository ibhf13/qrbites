import imageCompression from 'browser-image-compression'
import { CompressionOptions, CropArea } from '../types'

/**
 * Compresses an image file using browser-image-compression
 */
export const compressImage = async (
    file: File,
    options: CompressionOptions
): Promise<File> => {
    try {
        const compressedFile = await imageCompression(file, {
            maxSizeMB: options.maxSizeMB || 1,
            maxWidthOrHeight: options.maxWidthOrHeight || 1920,
            useWebWorker: options.useWebWorker !== false,
            fileType: options.fileType || file.type,
        })

        return compressedFile
    } catch (error) {
        console.error('Error compressing image:', error)
        throw new Error('Failed to compress image')
    }
}

/**
 * Creates an image preview URL from a File object
 */
export const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file)
}

/**
 * Releases an object URL to free up memory
 */
export const releaseObjectUrl = (url: string): void => {
    URL.revokeObjectURL(url)
}

/**
 * Creates a cropped image from the original based on crop area
 */
export const cropImage = async (
    imageSrc: string,
    cropArea: CropArea,
    fileType = 'image/jpeg',
    quality = 0.8
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = imageSrc

        image.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Failed to get canvas context'))
                return
            }

            // Set canvas dimensions to cropped area
            canvas.width = cropArea.width
            canvas.height = cropArea.height

            // Draw the cropped portion of the image
            ctx.drawImage(
                image,
                cropArea.x,
                cropArea.y,
                cropArea.width,
                cropArea.height,
                0,
                0,
                cropArea.width,
                cropArea.height
            )

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Failed to create image blob'))
                    }
                },
                fileType,
                quality
            )
        }

        image.onerror = () => {
            reject(new Error('Failed to load image for cropping'))
        }
    })
}

/**
 * Converts a blob to a file
 */
export const blobToFile = (blob: Blob, filename: string): File => {
    return new File([blob], filename, { type: blob.type })
} 