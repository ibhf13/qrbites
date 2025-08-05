import React from 'react'
import { Box, Card, FlexBox, Typography, Badge } from '@/components/common'
import { ClockIcon, ShareIcon } from '@heroicons/react/24/outline'
import { MenuComponentProps } from '../types/viewer.types'
import { useMenuShare } from '../hooks'
import { VIEWER_CONFIG } from '../constants/viewer.constants'

const MenuHeader: React.FC<MenuComponentProps> = ({ menuData }) => {
  const { shareMenu, isShareNotificationOpen } = useMenuShare()
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleShare = () => {
    shareMenu({
      title: `${menuData.menu.name} - ${menuData.menu.restaurant.name}`,
      text: `Check out this menu from ${menuData.menu.restaurant.name}`,
      url: window.location.href
    })
  }

  return (
    <Box className="bg-white dark:bg-neutral-900 shadow-lg dark:shadow-2xl sticky top-0 z-20 border-b border-neutral-200 dark:border-neutral-700">
      <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
        <FlexBox align="center" justify="between" className="py-4 sm:py-6">
          <FlexBox align="center" gap="lg" className="flex-1 min-w-0">
            {menuData.menu.restaurant.logoUrl && (
              <Box className="flex-shrink-0">
                <img
                  src={menuData.menu.restaurant.logoUrl}
                  alt={menuData.menu.restaurant.name}
                  className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl object-cover shadow-md ring-2 ring-primary-100 dark:ring-primary-900"
                />
              </Box>
            )}
            <Box className="min-w-0 flex-1 space-y-2.5">
              <Typography variant="heading" className="font-semibold text-xl sm:text-2xl lg:text-3xl text-neutral-900 dark:text-neutral-100 truncate">
                {menuData.menu.restaurant.name}
              </Typography>
              <Typography variant="heading" className="font-semibold text-base sm:text-lg lg:text-xl text-primary-600 dark:text-primary-400 truncate">
                {menuData.menu.name}
              </Typography>
              {menuData.menu.description && (
                <Typography variant="body" className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {menuData.menu.description}
                </Typography>
              )}
            </Box>
          </FlexBox>

          <FlexBox align="center" gap="sm" className="flex-shrink-0 ml-4">
            <FlexBox align="center" gap="xs" className="text-slate-500 dark:text-slate-400 text-sm hidden sm:flex">
              <ClockIcon className={VIEWER_CONFIG.ICON_SIZE_MD} />
              <span>{currentTime}</span>
            </FlexBox>
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
              title="Share menu"
            >
              <ShareIcon className={VIEWER_CONFIG.ICON_SIZE_LG} />
            </button>
          </FlexBox>
        </FlexBox>

        <FlexBox align="center" gap="md" className="pb-4 flex-wrap space-y-2.5">
          {menuData.menu.isActive && (
            <Badge variant="filled" color="success" className="text-xs" label="Active" />
          )}
          {menuData.menu.viewCount && (
            <Typography variant="caption" className="text-slate-500 dark:text-slate-400">
              {menuData.menu.viewCount} views
            </Typography>
          )}
          {menuData.menu.lastUpdated && (
            <Typography variant="caption" className="text-slate-500 dark:text-slate-400">
              Updated {new Date(menuData.menu.lastUpdated).toLocaleDateString()}
            </Typography>
          )}
        </FlexBox>
      </Box>

      {isShareNotificationOpen && (
        <Box className="absolute top-full left-4 right-4 mt-2 z-30">
          <Card variant="elevated" className="p-3 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
            <Typography variant="body" className="text-success-800 dark:text-success-200 text-center">
              Menu link copied to clipboard!
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  )
}

export default MenuHeader