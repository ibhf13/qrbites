import React from 'react'

interface PasswordStrengthIndicatorProps {
    password: string
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const getStrength = (): { strength: number; label: string; color: string } => {
        let strength = 0

        if (password.length >= 8) strength += 1
        if (/[A-Z]/.test(password)) strength += 1
        if (/[a-z]/.test(password)) strength += 1
        if (/[0-9]/.test(password)) strength += 1
        if (/[^A-Za-z0-9]/.test(password)) strength += 1

        const strengthMap = [
            { label: 'Very Weak', color: 'bg-red-500' },
            { label: 'Weak', color: 'bg-orange-500' },
            { label: 'Moderate', color: 'bg-yellow-500' },
            { label: 'Strong', color: 'bg-blue-500' },
            { label: 'Very Strong', color: 'bg-green-500' },
        ]

        return {
            strength,
            label: strengthMap[strength]?.label || 'None',
            color: strengthMap[strength]?.color || 'bg-gray-200'
        }
    }

    const { strength, label, color } = getStrength()

    return (
        <div className="mt-2 mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength</span>
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                ></div>
            </div>
            <ul className="mt-2 text-xs text-gray-600 space-y-1">
                <li className={`${password.length >= 8 ? 'text-green-500' : ''}`}>
                    • Minimum 8 characters
                </li>
                <li className={`${/[A-Z]/.test(password) ? 'text-green-500' : ''}`}>
                    • At least one uppercase letter
                </li>
                <li className={`${/[a-z]/.test(password) ? 'text-green-500' : ''}`}>
                    • At least one lowercase letter
                </li>
                <li className={`${/[0-9]/.test(password) ? 'text-green-500' : ''}`}>
                    • At least one number
                </li>
                <li className={`${/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}`}>
                    • At least one special character
                </li>
            </ul>
        </div>
    )
}

export default PasswordStrengthIndicator 