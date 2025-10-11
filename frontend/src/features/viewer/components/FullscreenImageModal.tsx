import React from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { Box, IconButton, LoadingSpinner, Typography } from '@/components/common'
import { cn } from '@/utils/cn'
import { useImageModal, useMenuDownload } from '../hooks'
import { PublicMenu } from '../types/viewer.types'

interface FullscreenImageModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    alt: string
    title?: string
    menuData?: PublicMenu
}

const FullscreenImageModal: React.FC<FullscreenImageModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    alt,
    title,
    menuData
}) => {
    const {
        imageState,
        setImageLoaded,
        setImageError,
        zoomState,
        handleZoomIn,
        handleZoomOut,
        handleResetZoom,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        getZoomPercentage,
        getCursorClass
    } = useImageModal({ isOpen, onClose })

    const { downloadMenuImage, isDownloading, canDownload } = useMenuDownload(menuData)

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <Box className="fixed inset-0 bg-black/90" aria-hidden="true" />

            <Box className="fixed inset-0 flex items-center justify-center">
                <DialogPanel className="relative w-full h-full flex flex-col">
                    <Box className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
                        <Box className="flex items-center gap-2">
                            {title && (
                                <Typography variant="heading" className="text-white font-medium">
                                    {title}
                                </Typography>
                            )}
                        </Box>

                        <Box className="flex items-center gap-2">
                            <IconButton
                                onClick={handleZoomOut}
                                icon={MagnifyingGlassMinusIcon}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                                disabled={zoomState.scale <= 0.5}
                            />
                            <Typography
                                variant="caption"
                                className="text-white min-w-[3rem] text-center cursor-pointer hover:text-gray-300"
                                onClick={handleResetZoom}
                            >
                                {getZoomPercentage()}%
                            </Typography>
                            <IconButton
                                onClick={handleZoomIn}
                                icon={MagnifyingGlassPlusIcon}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                                disabled={zoomState.scale >= 5}
                            />

                            {canDownload && (
                                <IconButton
                                    onClick={downloadMenuImage}
                                    icon={ArrowDownTrayIcon}
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20"
                                    disabled={isDownloading}
                                    title={isDownloading ? 'Downloading...' : 'Download Menu'}
                                />
                            )}

                            <IconButton
                                onClick={onClose}
                                icon={XMarkIcon}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20 ml-2"
                            />
                        </Box>
                    </Box>

                    <Box
                        className="flex-1 flex items-center justify-center overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                    >
                        {!imageState.isLoaded && !imageState.hasError && (
                            <Box className="absolute inset-0 flex items-center justify-center">
                                <LoadingSpinner />
                            </Box>
                        )}

                        {imageState.hasError && (
                            <Box className="flex flex-col items-center gap-4">
                                <Typography variant="heading" className="text-white">
                                    Failed to load image
                                </Typography>
                                <Typography variant="body" className="text-gray-300">
                                    The image could not be displayed
                                </Typography>
                            </Box>
                        )}

                        <img
                            src={imageUrl}
                            alt={alt}
                            className={cn(
                                "max-w-none transition-all duration-200 ease-out select-none",
                                getCursorClass(),
                                {
                                    "opacity-0": !imageState.isLoaded
                                }
                            )}
                            style={{
                                transform: `scale(${zoomState.scale}) translate(${zoomState.position.x / zoomState.scale}px, ${zoomState.position.y / zoomState.scale}px)`,
                                maxHeight: zoomState.scale === 1 ? '90vh' : 'none',
                                maxWidth: zoomState.scale === 1 ? '90vw' : 'none'
                            }}
                            onLoad={setImageLoaded}
                            onError={setImageError}
                            onDoubleClick={handleResetZoom}
                            draggable={false}
                        />
                    </Box>

                </DialogPanel>
            </Box>
        </Dialog>
    )
}

export default FullscreenImageModal