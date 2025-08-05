import env from '@/config/env'
import { PublicMenuData } from '../types/viewer.types'
import { Menu } from '@/features/menus'

interface FetchPublicMenuParams {
  menuId: string
  restaurantId?: string
}

interface FetchPublicMenuHeaders {
  'X-QR-Scan': string
  'X-User-Agent': string
  'X-Referrer': string
  'X-Timestamp': string
}

const createRequestHeaders = (): FetchPublicMenuHeaders => ({
  'X-QR-Scan': 'true',
  'X-User-Agent': navigator.userAgent,
  'X-Referrer': document.referrer || 'direct',
  'X-Timestamp': new Date().toISOString()
})

const buildQueryParams = (restaurantId?: string): string => {
  const queryParams = new URLSearchParams()

  if (restaurantId) {
    queryParams.append('restaurant', restaurantId)
  }

  return queryParams.toString()
}

const transformMenuResponse = (menu: Menu): PublicMenuData => ({
  menu: {
    id: menu._id,
    name: menu.name,
    description: menu.description,
    imageUrl: menu.imageUrl,
    restaurant: {
      id: menu.restaurantId.id,
      name: menu.restaurantId.name
    },
    isActive: menu.isActive,
    lastUpdated: menu.updatedAt || menu.createdAt,
  }
})

export const fetchPublicMenu = async ({
  menuId,
  restaurantId
}: FetchPublicMenuParams): Promise<PublicMenuData> => {
  const queryString = buildQueryParams(restaurantId)
  const headers = createRequestHeaders()

  const url = `${env.apiUrl || 'http://localhost:5000'}/api/public/menus/${menuId}${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, { headers: { ...headers } })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch menu`)
  }

  const data = await response.json()


  return transformMenuResponse(data.data)
}