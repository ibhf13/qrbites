import React from 'react'

interface ImagePreviewProps {
    src: string
    filename: string
    size?: number
    onRemove?: () => void
    className?: string
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    src,
    filename,
    size,
    onRemove,
    className = '',
}) => {
    // Format file size
    const formatFileSize = (bytes: number | undefined): string => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes} bytes`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Truncate long filenames
    const truncateFilename = (name: string, maxLength = 20): string => {
        if (name.length <= maxLength) return name

        const extension = name.split('.').pop() || ''
        const nameWithoutExtension = name.substring(0, name.lastIndexOf('.'))

        return `${nameWithoutExtension.substring(0, maxLength - extension.length - 3)}...${extension}`
    }

    return (
        <div className={`relative group rounded-lg overflow-hidden shadow ${className}`}>
            <img
                src={src}
                alt={filename}
                className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                <div className="flex justify-end">
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-white hover:text-red-400 focus:outline-none"
                            aria-label="Remove image"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="text-white text-xs">
                    <p className="truncate font-medium" title={filename}>{truncateFilename(filename)}</p>
                    {size && <p className="text-gray-300">{formatFileSize(size)}</p>}
                </div>
            </div>
        </div>
    )
} 