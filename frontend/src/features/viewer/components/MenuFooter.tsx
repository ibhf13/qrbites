import React from 'react'
import { Box, FlexBox, Typography } from '@/components/common'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import { MenuComponentProps } from '../types/viewer.types'
import { VIEWER_CONFIG } from '../constants/viewer.constants'
import { useViewer } from '../contexts'

const SocialLinks: React.FC<MenuComponentProps> = ({ menuData }) => {
  const { restaurant } = menuData.menu

  if (!restaurant.website && !restaurant.socialMedia) {
    return null
  }

  return (
    <FlexBox className="gap-2 bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1.5 mt-auto">
      <Box className="flex-1 min-w-0">
        <FlexBox direction="col" gap="sm" className="sm:flex-row sm:items-center sm:justify-between space-y-2.5 sm:space-y-0">
          <Typography variant="caption" className="text-slate-500 dark:text-slate-400 text-xs">
            Connect with {restaurant.name}
          </Typography>
          <FlexBox align="center" gap="md">
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium transition-colors duration-200"
              >
                Website
              </a>
            )}
            {restaurant.socialMedia?.instagram && (
              <a
                href={restaurant.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium transition-colors duration-200"
              >
                Instagram
              </a>
            )}
            {restaurant.socialMedia?.facebook && (
              <a
                href={restaurant.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium transition-colors duration-200"
              >
                Facebook
              </a>
            )}
          </FlexBox>
        </FlexBox>
      </Box>
    </FlexBox>
  )
}

const MenuFooter: React.FC<MenuComponentProps> = ({ menuData }) => {
  const { scanTime } = useViewer()

  return (
    <Box className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 mt-8">
      <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-2">
        <FlexBox direction="col" gap="md" className="sm:flex-row sm:items-center sm:justify-between space-y-2.5 sm:space-y-0">
          <FlexBox direction="col" gap="xs" className="sm:flex-row sm:items-center sm:gap-md space-y-2.5 sm:space-y-0">
            <Typography variant="body" className="text-sm text-slate-600 dark:text-slate-400">
              Powered by{' '}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                QrBites
              </span>
              {' '}Digital Menu Solutions
            </Typography>
            <Typography variant="caption" className="text-xs text-slate-500 dark:text-slate-500">
              Transforming dining experiences
            </Typography>
          </FlexBox>

          <FlexBox align="center" gap="md" className="text-sm text-slate-500 dark:text-slate-400">
            <FlexBox align="center" gap="xs">
              <QrCodeIcon className={VIEWER_CONFIG.ICON_SIZE_SM} />
              <span className="text-xs">Scanned: {scanTime}</span>
            </FlexBox>
            <FlexBox align="center" gap="xs">
              <span className="inline-block w-2 h-2 bg-success-500 rounded-full" />
              <span className="text-xs">Live</span>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <SocialLinks menuData={menuData} />
      </Box>
    </Box>
  )
}

export default MenuFooter