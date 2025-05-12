import React from 'react'
import { useNavigate } from 'react-router-dom'

interface LogoProps {
    collapsed?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({
    className = '',
    size = 'md',
}) => {
    const getSizeClasses = (): { container: string, logo: string, text: string } => {
        switch (size) {
            case 'sm':
                return {
                    container: 'gap-2',
                    logo: 'w-6 h-6',
                    text: 'text-sm'
                }
            case 'lg':
                return {
                    container: 'gap-3',
                    logo: 'w-10 h-10',
                    text: 'text-lg'
                }
            case 'md':
            default:
                return {
                    container: 'gap-3',
                    logo: 'w-8 h-8',
                    text: 'text-base'
                }
        }
    }

    const { container, logo, text } = getSizeClasses()
    const navigate = useNavigate()
    const handleLogoRedirect = () => {
        navigate('/')
    }


    return (
        <div className={`flex items-center ${container} ${className}`} >
            {/* Logo icon could be an SVG or image */}
            <div className={`${logo} rounded-md bg-primary-500 flex items-center justify-center text-white`} onClick={handleLogoRedirect}>
                <span className="font-bold">Q</span>
            </div>
            <span className={`${text} font-semibold text-primary-600 dark:text-primary-400`}>
                QrBites
            </span>
        </div>
    )
}

export default Logo 