export interface Restaurant {
  id: string
  name: string
  logoUrl?: string
  description?: string
  address?: string
  phone?: string
  website?: string
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
}

export interface MenuCategory {
  id: string
  name: string
  description?: string
}

export interface PublicMenu {
  id: string
  name?: string
  description?: string
  imageUrl?: string
  restaurant: Restaurant
  isActive?: boolean
  viewCount?: number
  lastUpdated?: string
  categories?: string[]
}

export interface MenuShareData {
  title: string
  text: string
  url: string
}

export interface MenuErrorProps {
  onRetry?: () => void
  error?: Error
}
