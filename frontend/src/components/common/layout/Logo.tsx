import React from 'react'
import { FlexBox } from './FlexBox'
import { Box, Typography } from '../'
import QRBitesLogo from '@/assets/QRBites.svg'
import QRBitesLogoLight from '@/assets/QRBitesLight.svg'
import { useNavigate } from 'react-router-dom'
import useTheme from '@/contexts/ThemeContext'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showText?: boolean
    className?: string
}

const Logo: React.FC<LogoProps> = ({
    size = 'md',
    showText = true,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20'
    }

    const textVariants = {
        sm: 'body' as const,
        md: 'subheading' as const,
        lg: 'title' as const,
        xl: 'heading' as const
    }
    const navigate = useNavigate()
    const handleLogoRedirect = () => {
        navigate('/')
    }

    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'

    return (
        <FlexBox
            align="center"
            gap="sm"
            className={`cursor-pointer transition-transform hover:scale-105 ${className}`}
            onClick={handleLogoRedirect}
        >
            <Box className={`${sizeClasses[size]} flex-shrink-0`}>
                <img
                    src={isDarkMode ? QRBitesLogo : QRBitesLogoLight}
                    alt="QRBites Logo"
                    className="h-full w-full object-contain  fill-white light:fill-primary-900 drop-shadow-md"
                />
            </Box>
            {showText && (
                <Typography
                    variant={textVariants[size]}
                    className="font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent"
                >
                    QrBites
                </Typography>
            )}
        </FlexBox>
    )
}

export default Logo