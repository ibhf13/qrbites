import { useQuery } from '@tanstack/react-query'
import { fetchPublicMenu } from '../api/viewer.api'
import { VIEWER_CONFIG, QUERY_KEYS } from '../constants/viewer.constants'

interface UsePublicMenuParams {
  menuId?: string
  restaurantId?: string
}

export const usePublicMenu = ({ menuId, restaurantId }: UsePublicMenuParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PUBLIC_MENU, menuId, restaurantId],
    queryFn: () => fetchPublicMenu({ 
      menuId: menuId as string, 
      restaurantId: restaurantId || undefined 
    }),
    enabled: !!menuId,
    retry: VIEWER_CONFIG.RETRY_ATTEMPTS,
    retryDelay: VIEWER_CONFIG.RETRY_DELAY,
    staleTime: VIEWER_CONFIG.STALE_TIME,
    gcTime: VIEWER_CONFIG.GC_TIME
  })
}