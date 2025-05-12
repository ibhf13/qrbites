import React, { useCallback, useState } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'

interface ImageCropperProps {
    imageSrc: string
    onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
    aspectRatio?: number
    initialCrop?: Point
    initialZoom?: number
    className?: string
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
    imageSrc,
    onCropComplete,
    aspectRatio = 4 / 3,
    initialCrop = { x: 0, y: 0 },
    initialZoom = 1,
    className = '',
}) => {
    const [crop, setCrop] = useState<Point>(initialCrop)
    const [zoom, setZoom] = useState(initialZoom)

    const handleCropChange = useCallback((location: Point) => {
        setCrop(location)
    }, [])

    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom)
    }, [])

    const handleCropComplete = useCallback(
        (croppedArea: Area, croppedAreaPixels: Area) => {
            if (onCropComplete) {
                onCropComplete(croppedArea, croppedAreaPixels)
            }
        },
        [onCropComplete]
    )

    return (
        <div className={`relative h-80 ${className}`}>
            <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={handleCropChange}
                onCropComplete={handleCropComplete}
                onZoomChange={handleZoomChange}
            />

            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-75 rounded-lg p-3 shadow">
                <label htmlFor="zoom-slider" className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom
                </label>
                <input
                    id="zoom-slider"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Zoom control"
                />
            </div>
        </div>
    )
} 