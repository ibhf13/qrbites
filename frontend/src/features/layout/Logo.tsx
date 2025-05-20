import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography } from '@/components/common/layout'
import { FlexBox } from '@/components/common'

interface LogoProps {
    collapsed?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({
    className = '',
    size = 'md',
}) => {
    const getSizeClasses = (): { container: string, logo: string, variant: 'caption' | 'body' | 'subheading' } => {
        switch (size) {
            case 'sm':
                return {
                    container: 'gap-2',
                    logo: 'w-6 h-6',
                    variant: 'caption'
                }
            case 'lg':
                return {
                    container: 'gap-3',
                    logo: 'w-10 h-10',
                    variant: 'subheading'
                }
            case 'md':
            default:
                return {
                    container: 'gap-3',
                    logo: 'w-8 h-8',
                    variant: 'body'
                }
        }
    }

    const { container, logo, variant } = getSizeClasses()
    const navigate = useNavigate()
    const handleLogoRedirect = () => {
        navigate('/')
    }

    return (
        <button
            className={`flex items-center ${container} ${className} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md transition-colors`}
            onClick={handleLogoRedirect}
            aria-label="Go to home page"
        >
            <FlexBox
                align="center"
                justify="center"
                className={`${logo} rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white transition-colors`}
            >
                <Typography variant="body" weight="bold" color="inverse">
                    Q
                </Typography>
            </FlexBox>
            <Typography variant={variant} weight="semibold" color="primary">
                QrBites
            </Typography>
        </button>
    )
}

export default Logo 