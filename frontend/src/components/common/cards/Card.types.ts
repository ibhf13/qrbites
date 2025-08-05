import React from 'react'

export type CardVariant = 'default' | 'soft' | 'warm' | 'fresh' | 'earth' | 'elevated' | 'outlined' | 'glass'
export type CardSize = 'sm' | 'md' | 'lg'
export type ImageAspectRatio = 'square' | 'video' | 'wide' | 'tall' | 'auto'
export type HoverEffect = 'none' | 'lift' | 'scale' | 'glow'

export interface ActionItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'danger'
  color?: string
  disabled?: boolean
}

export interface CardImageProps {
  src?: string
  alt?: string
  aspectRatio?: ImageAspectRatio
  placeholder?: React.ReactNode
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  loading?: boolean
  onError?: () => void
  fallback?: React.ReactNode
}

export interface CardBadge {
  label: string
  variant?: 'filled' | 'outlined' | 'light'
  color?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: CardVariant
  size?: CardSize
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  title?: string
  subtitle?: string
  footer?: React.ReactNode
  headerAction?: React.ReactNode
  interactive?: boolean
  loading?: boolean
  image?: CardImageProps
  name?: string
  actions?: ActionItem[]
  showActionsOnHover?: boolean
  actionPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  badges?: CardBadge[]
  hoverEffect?: HoverEffect | 'custom'
  hoverScale?: number
  contentPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  'aria-label'?: string
  role?: string
  actionDirection?: 'col' | 'row'
}

export const aspectRatioClasses: Record<ImageAspectRatio, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[2/1]',
  tall: 'aspect-[3/4]',
  auto: 'h-44'
}

export const sizeClasses: Record<CardSize, { maxWidth: string; minHeight?: string }> = {
  sm: { maxWidth: 'max-w-sm' },
  md: { maxWidth: 'max-w-md' },
  lg: { maxWidth: 'max-w-lg' }
}

export const hoverEffectClasses: Record<HoverEffect, string> = {
  none: '',
  lift: 'hover:shadow-2xl hover:-translate-y-1',
  scale: 'hover:scale-[1.02]',
  glow: 'hover:shadow-glow'
}

export const actionPositionClasses = {
  'top-left': 'top-1 left-1',
  'top-right': 'top-1 right-1',
  'bottom-left': 'bottom-1 left-1',
  'bottom-right': 'bottom-1 right-1'
}