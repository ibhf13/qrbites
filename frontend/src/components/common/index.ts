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
export { default as FormError } from './forms/FormError'
export { default as FormInput } from './forms/FormInput'
export type { FormInputProps } from './forms/FormInput'
export { default as ValidationErrorSummary } from './forms/ValidationErrorSummary'

// Layout component exports
export { default as Card } from './layout/Card'
export type { CardProps } from './layout/Card'
export { Col, Container, Row } from './layout/Grid'
export type { ColProps, ContainerProps, RowProps } from './layout/Grid'
export { default as Header } from './layout/Header'
export { default as MainLayout } from './layout/MainLayout'
export { default as Sidebar } from './layout/Sidebar'
export { default as Typography } from './layout/Typography'
export type { TypographyProps } from './layout/Typography'
export { default as UserMenu } from './layout/UserMenu'

// Feedback component exports
export { default as Badge } from './feedback/Badge'
export type { BadgeColor, BadgeProps, BadgeSize, BadgeVariant } from './feedback/Badge'
export { default as ErrorBoundary } from './feedback/ErrorBoundary'
export { default as ErrorDisplay } from './feedback/ErrorDisplay'
export { default as NetworkStatusIndicator } from './feedback/NetworkStatusIndicator'
export { default as NotificationHistory } from './feedback/NotificationHistory'
export { default as Skeleton } from './feedback/Skeleton'
export type { SkeletonProps, SkeletonVariant } from './feedback/Skeleton'

export * from './feedback'
export * from './layout'
export * from './navigation'

// Add other common component exports here

