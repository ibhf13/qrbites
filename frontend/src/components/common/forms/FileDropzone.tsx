import React from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import { Card, Typography, Box, FlexBox } from '@/components/common'
import { cn } from '@/utils/cn'

interface FileDropzoneProps {
    onFileSelect: (files: File[]) => void
    accept?: Record<string, string[]>
    maxSize?: number
    multiple?: boolean
    disabled?: boolean
    title?: string
    subtitle?: string
    uploadText?: string
    dragText?: string
    helpText?: string
    className?: string
    variant?: 'default' | 'compact'
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
    onFileSelect,
    accept = {
        'image/jpeg': [],
        'image/png': [],
        'image/gif': [],
        'image/webp': []
    },
    maxSize = 2 * 1024 * 1024,
    multiple = false,
    disabled = false,
    title,
    subtitle,
    uploadText = 'Upload a file',
    dragText = 'or drag and drop',
    helpText,
    className,
    variant = 'default'
}) => {
    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple,
        disabled
    } as DropzoneOptions)

    const renderIcon = () => (
        <svg
            className={cn(
                'mx-auto',
                variant === 'compact' ? 'h-8 w-8' : 'h-12 w-12',
                isDragActive
                    ? 'text-primary-500 dark:text-primary-400'
                    : 'text-neutral-400 dark:text-neutral-500'
            )}
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
    )

    const renderContent = () => (
        <Box className="text-center">
            {renderIcon()}
            <Box mt={variant === 'compact' ? 'sm' : 'md'}>
                <Typography
                    as="p"
                    variant={variant === 'compact' ? 'caption' : 'body'}
                    color="neutral"
                    className="text-center"
                >
                    <span className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                        {uploadText}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400 ml-1">{dragText}</span>
                </Typography>
                {helpText && (
                    <Typography
                        as="p"
                        variant="caption"
                        color="muted"
                        className="mt-1 block"
                    >
                        {helpText}
                    </Typography>
                )}
            </Box>
        </Box>
    )

    if (variant === 'compact') {
        return (
            <Box
                p="md"
                rounded="lg"
                clickable
                className={cn(
                    'border-2 border-dashed transition-all duration-200',
                    {
                        'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/20': isDragActive,
                        'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500': !isDragActive,
                        'opacity-50 cursor-not-allowed': disabled
                    },
                    className
                )}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                {renderContent()}
            </Box>
        )
    }

    return (
        <FlexBox direction="col" gap="md" className={className}>
            {(title || subtitle) && (
                <Box>
                    {title && (
                        <Typography as="h4" variant="heading">
                            {title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography as="p" variant="body" color="muted">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            )}

            <Card
                variant="outlined"
                padding="lg"
                className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md',
                    {
                        'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/20 shadow-lg': isDragActive,
                        'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500': !isDragActive,
                        'opacity-50 cursor-not-allowed': disabled
                    }
                )}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                {renderContent()}
            </Card>
        </FlexBox>
    )
}

export default FileDropzone