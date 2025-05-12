import React, { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    icon: ReactNode
    iconBgColor?: string
    iconColor?: string
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconBgColor = 'bg-primary-100',
    iconColor = 'text-primary-600'
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
                <div className={`p-3 ${iconBgColor} rounded-lg`}>
                    <div className={`w-6 h-6 ${iconColor}`}>
                        {icon}
                    </div>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">{title}</p>
                    <p className="text-2xl font-semibold text-neutral-800">{value}</p>
                </div>
            </div>
        </div>
    )
}

export default StatCard 