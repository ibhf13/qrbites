import React, { useState, KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'
import { animations } from '@/utils/designTokenUtils'
import { Box, Typography } from '@/components/common'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

export interface TagInputProps {
    label?: string
    error?: string
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    helpText?: string
    maxTags?: number
    responsive?: boolean
    className?: string
    allowCommas?: boolean
    caseSensitive?: boolean
}

export const TagInput: React.FC<TagInputProps> = ({
    label,
    error,
    value = [],
    onChange,
    placeholder = 'Type and press Enter',
    helpText,
    maxTags,
    responsive = true,
    className,
    allowCommas = true,
    caseSensitive = false
}) => {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || (allowCommas && e.key === ',')) {
            e.preventDefault()
            addTags()
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1)
        }
    }

    const addTags = () => {
        const rawTags = allowCommas
            ? inputValue.split(',').map(tag => tag.trim())
            : [inputValue.trim()]

        const newTags = rawTags.filter(tag => {
            if (!tag) return false
            if (maxTags && value.length >= maxTags) return false

            const isDuplicate = caseSensitive
                ? value.includes(tag)
                : value.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())

            return !isDuplicate
        })

        if (newTags.length > 0) {
            const tagsToAdd = maxTags
                ? newTags.slice(0, maxTags - value.length)
                : newTags

            onChange([...value, ...tagsToAdd])
        }

        setInputValue('')
    }

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove))
    }

    const clearAll = () => {
        onChange([])
    }

    const isMaxReached = maxTags ? value.length >= maxTags : false

    return (
        <Box fullWidth className={className}>
            <Box className="flex items-center justify-between mb-1">
                {label && (
                    <Typography
                        variant="caption"
                        color="neutral"
                        className="block"
                    >
                        {label}
                    </Typography>
                )}
                {value.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className={cn(
                            'text-xs text-neutral-500 hover:text-neutral-700',
                            'dark:text-neutral-400 dark:hover:text-neutral-200',
                            'underline',
                            animations.transition
                        )}
                    >
                        Clear all
                    </button>
                )}
            </Box>

            <Box
                className={cn(
                    'w-full border rounded-2xl overflow-hidden',
                    'bg-white dark:bg-neutral-800',
                    animations.transition,
                    {
                        'border-error-500 dark:border-error-400 focus-within:ring-2 focus-within:ring-error-500': error,
                        'border-neutral-300 dark:border-neutral-600 focus-within:ring-2 focus-within:ring-primary-500': !error
                    }
                )}
            >
                {value.length > 0 && (
                    <Box className={cn(
                        'flex flex-wrap gap-2 items-center',
                        'border-b border-neutral-200 dark:border-neutral-700',
                        responsive ? 'px-3 py-2.5 text-base sm:px-3 sm:py-2 sm:text-sm' : 'px-3 py-2'
                    )}>
                        {value.map((tag, index) => (
                            <span
                                key={index}
                                className={cn(
                                    'inline-flex items-center gap-1.5',
                                    'px-2.5 py-1.5 rounded-full text-sm font-medium',
                                    'bg-primary-100 dark:bg-primary-900',
                                    'text-primary-700 dark:text-primary-200',
                                    'border border-primary-300 dark:border-primary-700',
                                    'hover:bg-primary-200 dark:hover:bg-primary-800',
                                    animations.transition
                                )}
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className={cn(
                                        'hover:bg-primary-300 dark:hover:bg-primary-700',
                                        'rounded-full p-0.5',
                                        animations.transition,
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500'
                                    )}
                                    aria-label={`Remove ${tag}`}
                                >
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </Box>
                )}

                <Box className={cn(
                    'flex items-center gap-2 w-full',
                    responsive ? 'px-3 py-2.5 text-base sm:px-3 sm:py-2 sm:text-sm' : 'px-3 py-2',
                    responsive && 'min-h-[44px] sm:min-h-[36px]'
                )}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={addTags}
                        placeholder={placeholder}
                        disabled={isMaxReached}
                        className={cn(
                            'flex-1 outline-none',
                            'bg-transparent',
                            'text-neutral-900 dark:text-neutral-100',
                            'placeholder-neutral-400 dark:placeholder-neutral-500',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />
                    {inputValue && !isMaxReached && (
                        <button
                            type="button"
                            onClick={addTags}
                            className={cn(
                                'p-1.5 rounded-full',
                                'text-primary-600 dark:text-primary-400',
                                'hover:bg-primary-100 dark:hover:bg-primary-900',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                animations.transition
                            )}
                            aria-label="Add tag"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    )}
                </Box>
            </Box>

            {(helpText || maxTags) && !error && (
                <Box className="flex items-center justify-between mt-1">
                    {helpText && (
                        <Typography
                            variant="caption"
                            color="neutral"
                            className="text-xs"
                        >
                            {helpText}
                        </Typography>
                    )}
                    {maxTags && (
                        <Typography
                            variant="caption"
                            color="neutral"
                            className={cn('text-xs', {
                                'text-warning-600 dark:text-warning-400': value.length >= maxTags
                            })}
                        >
                            {value.length}/{maxTags}
                        </Typography>
                    )}
                </Box>
            )}

            {error && (
                <Typography
                    variant="caption"
                    color="error"
                    className={cn('mt-1')}
                >
                    {error}
                </Typography>
            )}
        </Box>
    )
}

export default TagInput

