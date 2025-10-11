import { useQuery } from '@tanstack/react-query'
import { fetchPublicMenu } from '../api/viewer.api'
import { VIEWER_CONFIG, QUERY_KEYS } from '../constants/viewer.constants'

export const usePublicMenu = (menuId: string) => {

  return useQuery({
    queryKey: [QUERY_KEYS.PUBLIC_MENU, menuId],
    queryFn: () => fetchPublicMenu(menuId),
    enabled: !!menuId,
    retry: VIEWER_CONFIG.RETRY_ATTEMPTS,
    retryDelay: VIEWER_CONFIG.RETRY_DELAY,
    staleTime: VIEWER_CONFIG.STALE_TIME,
    gcTime: VIEWER_CONFIG.GC_TIME
  })
}