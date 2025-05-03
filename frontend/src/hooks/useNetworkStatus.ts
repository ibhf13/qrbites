import { useEffect, useState } from 'react'

interface NetworkStatus {
    isOnline: boolean
    wasOffline: boolean
    since: Date | null
}

export const useNetworkStatus = (): NetworkStatus => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
    const [wasOffline, setWasOffline] = useState<boolean>(false)
    const [since, setSince] = useState<Date | null>(null)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            if (!isOnline) {
                setWasOffline(true)
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
            setSince(new Date())
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [isOnline])

    return { isOnline, wasOffline, since }
}

export default useNetworkStatus 