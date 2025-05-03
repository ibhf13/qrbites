// Export all common components
export { default as LoadingSpinner } from './feedback/LoadingSpinner'
export * from './feedback/NotificationSnackbar'
export { default as PasswordStrengthIndicator } from './feedback/PasswordStrengthIndicator'

// Add other exports as they're created
// export * from './buttons';
// export * from './forms';
// export * from './layout';

// Button exports
export { default as Button } from './buttons/Button'
export type { ButtonProps, ButtonSize, ButtonVariant } from './buttons/Button'
export { default as ThemeToggle } from './buttons/ThemeToggle'

// Form component exports
export { default as FormInput } from './forms/FormInput'
export type { FormInputProps } from './forms/FormInput'

// Layout component exports
export { default as Card } from './layout/Card'
export type { CardProps } from './layout/Card'
export { Col, Container, Row } from './layout/Grid'
export type { ColProps, ContainerProps, RowProps } from './layout/Grid'
export { default as Typography } from './layout/Typography'
export type { TypographyProps } from './layout/Typography'

// Feedback component exports
export { default as Badge } from './feedback/Badge'
export type { BadgeColor, BadgeProps, BadgeSize, BadgeVariant } from './feedback/Badge'
export { default as ErrorDisplay } from './feedback/ErrorDisplay'
export { default as Skeleton } from './feedback/Skeleton'
export type { SkeletonProps, SkeletonVariant } from './feedback/Skeleton'

