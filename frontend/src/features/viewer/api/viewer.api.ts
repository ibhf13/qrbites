import env from '@/config/env'
import { PublicMenu } from '../types/viewer.types'
import { createTrackingHeaders, withErrorHandling } from '@/utils/apiUtils'

export const fetchPublicMenu = async (menuId: string): Promise<PublicMenu> => {
  return withErrorHandling(async () => {


    const headers = createTrackingHeaders()

    const url = `${env.apiUrl || 'http://localhost:5000'}/api/public/menus/${menuId}`

    const response = await fetch(url, { headers: { ...headers } })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch menu`)
    }

    const result = await response.json()

    return result.data

  }, `Failed to fetch public menu with id: ${menuId}`)
}