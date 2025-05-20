import React from 'react'
import { Card, FlexBox, Box, Typography } from '@/components/common'
import { CheckmarkIcon } from './Icon'
import { cn } from '@/utils/cn'

interface PasswordStrengthIndicatorProps {
    password: string
    showRequirements?: boolean
    showLabel?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
    animated?: boolean
}

interface StrengthResult {
    strength: number
    label: string
    colorClass: string
    textColorClass: string
    percentage: number
    score: 'very-weak' | 'weak' | 'moderate' | 'strong' | 'very-strong'
}

interface ValidationRule {
    test: (password: string) => boolean
    label: string
    key: string
    weight: number
}

const validationRules: ValidationRule[] = [
    {
        test: (password: string) => password.length >= 8,
        label: 'At least 8 characters',
        key: 'length',
        weight: 1
    },
    {
        test: (password: string) => /[A-Z]/.test(password),
        label: 'One uppercase letter',
        key: 'uppercase',
        weight: 1
    },
    {
        test: (password: string) => /[a-z]/.test(password),
        label: 'One lowercase letter',
        key: 'lowercase',
        weight: 1
    },
    {
        test: (password: string) => /[0-9]/.test(password),
        label: 'One number',
        key: 'number',
        weight: 1
    },
    {
        test: (password: string) => /[^A-Za-z0-9]/.test(password),
        label: 'One special character',
        key: 'special',
        weight: 1
    },
    {
        test: (password: string) => password.length >= 12,
        label: '12+ characters (recommended)',
        key: 'long',
        weight: 0.5
    }
]

const strengthLevels = [
    {
        label: 'Very Weak',
        colorClass: 'bg-error-500',
        textColorClass: 'text-error-600 dark:text-error-400',
        score: 'very-weak' as const
    },
    {
        label: 'Weak',
        colorClass: 'bg-warning-500',
        textColorClass: 'text-warning-600 dark:text-warning-400',
        score: 'weak' as const
    },
    {
        label: 'Moderate',
        colorClass: 'bg-accent-500',
        textColorClass: 'text-accent-600 dark:text-accent-400',
        score: 'moderate' as const
    },
    {
        label: 'Strong',
        colorClass: 'bg-info-500',
        textColorClass: 'text-info-600 dark:text-info-400',
        score: 'strong' as const
    },
    {
        label: 'Very Strong',
        colorClass: 'bg-success-500',
        textColorClass: 'text-success-600 dark:text-success-400',
        score: 'very-strong' as const
    }
]

const sizeConfig = {
    sm: {
        bar: 'h-1.5',
        spacing: 'mt-1 mb-2',
        reqSpacing: 'mt-2'
    },
    md: {
        bar: 'h-2',
        spacing: 'mt-2 mb-4',
        reqSpacing: 'mt-3'
    },
    lg: {
        bar: 'h-3',
        spacing: 'mt-3 mb-4',
        reqSpacing: 'mt-4'
    }
}

const calculatePasswordStrength = (password: string): StrengthResult => {
    const totalWeight = validationRules.reduce((sum, rule) => sum + rule.weight, 0)
    const score = validationRules.reduce((sum, rule) => {
        return rule.test(password) ? sum + rule.weight : sum
    }, 0)

    const percentage = Math.min((score / totalWeight) * 100, 100)
    const strength = Math.floor((score / totalWeight) * 4)

    const strengthData = strengthLevels[Math.min(strength, 4)] || strengthLevels[0]

    return {
        strength: Math.min(strength, 4),
        label: strengthData.label,
        colorClass: strengthData.colorClass,
        textColorClass: strengthData.textColorClass,
        percentage,
        score: strengthData.score
    }
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
    showRequirements = true,
    showLabel = true,
    className,
    size = 'md',
    animated = true
}) => {
    const { strength, label, colorClass, textColorClass, percentage } = calculatePasswordStrength(password)
    const sizeClasses = sizeConfig[size]

    const fulfilledRequirements = validationRules.filter(rule => rule.test(password)).length
    const totalRequirements = validationRules.length

    return (
        <Box className={cn(sizeClasses.spacing, className)}>
            {showLabel && (
                <FlexBox justify="between" align="center" className="mb-2">
                    <Typography variant="caption" color="muted" className="font-medium">
                        Password Strength
                    </Typography>
                    <Typography
                        variant="caption"
                        className={cn('font-semibold transition-colors duration-300', textColorClass)}
                    >
                        {password ? label : 'Enter password'}
                    </Typography>
                </FlexBox>
            )}

            <Box className="relative">
                <Box
                    className={cn(
                        'w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden',
                        sizeClasses.bar,
                        {
                            'transition-all duration-500 ease-out': animated
                        }
                    )}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Password strength: ${label}, ${fulfilledRequirements} of ${totalRequirements} requirements met`}
                >
                    <Box
                        className={cn(
                            sizeClasses.bar,
                            colorClass,
                            'relative overflow-hidden',
                            {
                                'transition-all duration-500 ease-out transform-gpu': animated
                            }
                        )}
                        style={{ width: `${percentage}%` }}
                    >
                        {animated && percentage > 0 && (
                            <Box className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                    </Box>
                </Box>

                <FlexBox justify="between" className="mt-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                        <Box
                            key={level}
                            className={cn(
                                'w-2 h-1 rounded-full transition-all duration-300',
                                strength >= level ? colorClass : 'bg-neutral-300 dark:bg-neutral-600'
                            )}
                        />
                    ))}
                </FlexBox>
            </Box>

            {showRequirements && (
                <Card variant="soft" padding="sm" className={sizeClasses.reqSpacing}>
                    <Typography variant="caption" color="muted" className="block mb-2 font-medium">
                        Password Requirements:
                    </Typography>
                    <FlexBox className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {validationRules.slice(0, 5).map((rule) => {
                            const isValid = rule.test(password)

                            return (
                                <FlexBox key={rule.key} direction="col" gap="xs" className="flex items-center space-x-2 group">
                                    <Box className={cn(
                                        'w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200',
                                        {
                                            'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400': isValid,
                                            'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500': !isValid
                                        }
                                    )}>
                                        {isValid ? (
                                            <CheckmarkIcon />
                                        ) : (
                                            <Box className="w-1.5 h-1.5 bg-current rounded-full" />
                                        )}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        className={cn(
                                            'transition-all duration-200 flex-1',
                                            {
                                                'text-success-700 dark:text-success-300 font-medium': isValid,
                                                'text-neutral-600 dark:text-neutral-400': !isValid
                                            }
                                        )}
                                    >
                                        {rule.label}
                                    </Typography>
                                    <span className="sr-only">
                                        {isValid ? 'Requirement met' : 'Requirement not met'}
                                    </span>
                                </FlexBox>
                            )
                        })}
                    </FlexBox>
                </Card>
            )}
        </Box>
    )
}

export { calculatePasswordStrength, validationRules as getValidationRules }
export type { PasswordStrengthIndicatorProps, StrengthResult, ValidationRule }
export default PasswordStrengthIndicator