
export const downloadImageFromUrl = async (
    imageUrl: string,
    filename: string
): Promise<void> => {
    try {
        const response = await fetch(imageUrl)

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
        }

        const blob = await response.blob()

        downloadBlob(blob, filename)
    } catch (error) {
        console.error('Error downloading image:', error)
        throw new Error('Failed to download menu image')
    }
}

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

export const getMenuDownloadFilename = (
    menuName: string,
    restaurantName: string,
    imageUrl: string
): string => {
    const urlParts = imageUrl.split('.')
    const extension = urlParts.length > 1 ? urlParts.pop()?.toLowerCase() || 'jpg' : 'jpg'

    const cleanMenuName = menuName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    const cleanRestaurantName = restaurantName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

    return `${cleanRestaurantName}-${cleanMenuName}-menu.${extension}`
}


export const checkImageAccess = async (imageUrl: string): Promise<boolean> => {
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' })

        return response.ok
    } catch {
        return false
    }
}