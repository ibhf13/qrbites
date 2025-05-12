import { ImageType } from '../types'

const MAX_FILE_SIZES = {
    logo: 2 * 1024 * 1024, // 2MB
    menuPhoto: 5 * 1024 * 1024, // 5MB
}

const ACCEPTED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
]

const RECOMMENDED_DIMENSIONS = {
    logo: { width: 512, height: 512 },
    menuPhoto: { width: 1200, height: 900 },
}

export const validateFileType = (file: File): boolean => {
    return ACCEPTED_FILE_TYPES.includes(file.type)
}

export const validateFileSize = (file: File, type: ImageType): boolean => {
    return file.size <= MAX_FILE_SIZES[type]
}

export const getFileValidationError = (file: File, type: ImageType): string | null => {
    if (!validateFileType(file)) {
        return `Invalid file type. Accepted types: ${ACCEPTED_FILE_TYPES.map(type => type.split('/')[1]).join(', ')}`
    }

    if (!validateFileSize(file, type)) {
        const sizeInMB = MAX_FILE_SIZES[type] / (1024 * 1024)
        return `File size exceeds the maximum limit of ${sizeInMB}MB`
    }

    return null
}

export const getRecommendedDimensions = (type: ImageType) => {
    return RECOMMENDED_DIMENSIONS[type]
}

export const getAcceptedFileTypesString = (): string => {
    return ACCEPTED_FILE_TYPES.join(',')
}

export const getMaxFileSize = (type: ImageType): number => {
    return MAX_FILE_SIZES[type]
} 