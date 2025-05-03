import React, { useCallback, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { useProfileData } from '../hooks/useProfileData'

interface Point {
    x: number
    y: number
}

interface Area {
    x: number
    y: number
    width: number
    height: number
}

const AvatarUpload: React.FC = () => {
    const { uploadAvatar, isUploadingAvatar, avatarUploadError } = useProfileData()
    const [image, setImage] = useState<string | null>(null)
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isCropping, setIsCropping] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            const reader = new FileReader()

            reader.addEventListener('load', () => {
                setImage(reader.result as string)
                setIsCropping(true)
            })

            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        // Set canvas dimensions to match the cropped area
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        // Draw the cropped image
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                resolve(blob)
            }, 'image/jpeg')
        })
    }

    const uploadCroppedImage = async () => {
        if (!image || !croppedAreaPixels) return

        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels)

            // Create a file from the blob
            const file = new File([croppedImage], 'avatar.jpg', { type: 'image/jpeg' })

            // Create a FormData instance
            const formData = new FormData()
            formData.append('avatar', file)

            // Upload the cropped image
            uploadAvatar(formData)

            // Reset cropping state
            setIsCropping(false)
            setImage(null)

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Error creating cropped image:', error)
        }
    }

    const cancelCrop = () => {
        setIsCropping(false)
        setImage(null)

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-4">
            {!isCropping ? (
                <div className="flex flex-col items-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="avatar-upload"
                    />
                    <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {isUploadingAvatar ? 'Uploading...' : 'Select Image'}
                    </label>

                    {avatarUploadError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 mt-4">
                            Failed to upload avatar. Please try again.
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <Cropper
                            image={image || ''}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    <div className="mt-4 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zoom
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <button
                            type="button"
                            onClick={cancelCrop}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={uploadCroppedImage}
                            disabled={isUploadingAvatar}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AvatarUpload 