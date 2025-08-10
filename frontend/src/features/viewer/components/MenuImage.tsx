import React, { useState } from 'react'
import { Box, Card, FlexBox, LoadingSpinner, Typography } from '@/components/common'
import { QrCodeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { MenuComponentProps } from '../types/viewer.types'
import { VIEWER_CONFIG, FILE_TYPES } from '../constants/viewer.constants'
import { FullscreenImageModal } from '.'

const MenuImagePlaceholder: React.FC<MenuComponentProps> = ({ menuData }) => (
  <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Card
      variant="outlined"
      className="text-center border-dashed border-2 border-neutral-300 dark:border-neutral-600 h-full flex flex-col"
      contentPadding="sm"
    >
      <Box className="flex-1 space-y-2.5">
        <Box className="flex flex-col items-center gap-6 py-12">
          <Box className="relative">
            <QrCodeIcon className={VIEWER_CONFIG.ICON_SIZE_2XL} />
            <Box className="absolute inset-0 bg-gradient-to-r from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-700 opacity-20 rounded-lg blur-xl" />
          </Box>
          <Box className="text-center space-y-2.5">
            <Typography variant="heading" className="font-semibold text-base text-neutral-700 dark:text-neutral-300">
              Menu Image Unavailable
            </Typography>
            <Typography variant="body" className="text-sm text-slate-600 dark:text-slate-400">
              The digital menu image is currently not available.
            </Typography>
            <Typography variant="body" className="text-sm text-slate-500 dark:text-slate-500">
              Please contact the restaurant directly for menu information.
            </Typography>
          </Box>
          {(menuData.menu.restaurant.phone || menuData.menu.restaurant.address) && (
            <FlexBox className="gap-2 bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1.5 mt-auto w-full">
              <Box className="flex-1 min-w-0 space-y-2.5">
                {menuData.menu.restaurant.phone && (
                  <FlexBox align="center" gap="sm">
                    <PhoneIcon className={`${VIEWER_CONFIG.ICON_SIZE_SM} text-slate-500 dark:text-slate-400 flex-shrink-0`} />
                    <Typography variant="caption" className="text-slate-600 dark:text-slate-300 text-xs">
                      {menuData.menu.restaurant.phone}
                    </Typography>
                  </FlexBox>
                )}
                {menuData.menu.restaurant.address && (
                  <FlexBox align="center" gap="sm">
                    <MapPinIcon className={`${VIEWER_CONFIG.ICON_SIZE_SM} text-slate-500 dark:text-slate-400 flex-shrink-0`} />
                    <Typography variant="caption" className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2">
                      {menuData.menu.restaurant.address}
                    </Typography>
                  </FlexBox>
                )}
              </Box>
            </FlexBox>
          )}
        </Box>
      </Box>
    </Card>
  </Box>
)

const PdfViewer: React.FC<{ imageUrl: string; menuName: string }> = ({ imageUrl, menuName }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <Box className="relative">
      <iframe
        src={imageUrl}
        title={`${menuName} - Menu`}
        className={`w-full h-screen min-h-[${VIEWER_CONFIG.MIN_IFRAME_HEIGHT_SM}] lg:min-h-[${VIEWER_CONFIG.MIN_IFRAME_HEIGHT_LG}]`}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && (
        <Box className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700">
          <LoadingSpinner />
        </Box>
      )}
    </Box>
  )
}

const ImageViewer: React.FC<{ imageUrl: string; menuName: string; menuData: MenuComponentProps['menuData'] }> = ({ imageUrl, menuName, menuData }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

  const handleImageClick = () => {
    if (isLoaded && !hasError) {
      setIsFullscreenOpen(true)
    }
  }

  return (
    <>
      <Box className="relative">
        <img
          src={imageUrl}
          alt={`${menuName} - Menu`}
          className="w-full h-auto object-contain transition-opacity duration-300 cursor-pointer hover:opacity-90"
          style={{
            maxHeight: VIEWER_CONFIG.MAX_IMAGE_HEIGHT,
            opacity: isLoaded ? 1 : 0
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          onClick={handleImageClick}
          title="Click to view fullscreen"
        />
        {!isLoaded && !hasError && (
          <Box className={`absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 min-h-[${VIEWER_CONFIG.MIN_IMAGE_HEIGHT}]`}>
            <LoadingSpinner />
          </Box>
        )}
        {hasError && (
          <Box className={`flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 min-h-[${VIEWER_CONFIG.MIN_IMAGE_HEIGHT}]`}>
            <Typography variant="body" className="text-neutral-600 dark:text-neutral-400">
              Failed to load menu image
            </Typography>
          </Box>
        )}
      </Box>

      <FullscreenImageModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        imageUrl={imageUrl}
        alt={`${menuName} - Menu`}
        title={menuName}
        menuData={menuData}
      />
    </>
  )
}

const MenuImage: React.FC<MenuComponentProps> = ({ menuData }) => {
  if (!menuData.menu.imageUrl) {
    return <MenuImagePlaceholder menuData={menuData} />
  }

  const isPdf = menuData.menu.imageUrl.toLowerCase().includes(FILE_TYPES.PDF_EXTENSION)

  return (
    <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card
        variant="elevated"
        className="overflow-hidden bg-white dark:bg-neutral-900 shadow-xl dark:shadow-2xl"
        contentPadding="none"
      >
        {isPdf ? (
          <PdfViewer imageUrl={menuData.menu.imageUrl} menuName={menuData.menu.name} />
        ) : (
          <ImageViewer imageUrl={menuData.menu.imageUrl} menuName={menuData.menu.name} menuData={menuData} />
        )}
      </Card>
    </Box>
  )
}

export default MenuImage