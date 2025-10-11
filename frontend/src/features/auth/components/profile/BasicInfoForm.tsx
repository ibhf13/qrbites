import React from 'react'
import { Box, Typography, Card, FlexBox } from '@/components/common'
import { AuthUser } from '../../types/auth.types'

interface BasicInfoFormProps {
    user: AuthUser
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ user }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not available'

        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <Box className="space-y-1" >
            <Typography variant="caption" color="muted" className="font-medium" >
                {label}
            </Typography>
            < Typography variant="body" className="bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-md" >
                {value}
            </Typography>
        </Box>
    )

    return (
        <Card variant="outlined" className="h-fit" >
            <Box p="lg" className="space-y-6" >
                <Box>
                    <Typography variant="heading" className="font-semibold mb-2" >
                        Account Information
                    </Typography>
                    < Typography variant="body" color="muted" >
                        Your basic account details
                    </Typography>
                </Box>

                < Box className="space-y-4" >
                    <InfoField label="Full Name" value={user.name} />
                    <InfoField label="Display Name" value={user.displayName || user.name} />
                    <InfoField label="Email Address" value={user.email} />
                    <InfoField label="Role" value={user.role} />
                    <InfoField
                        label="Account Status"
                        value={user.isActive ? 'Active' : 'Inactive'}
                    />
                    <InfoField label="Member Since" value={formatDate(user.createdAt)} />
                </Box>

                < Box className="pt-4 border-t border-neutral-200 dark:border-neutral-700" >
                    <FlexBox align="center" gap="sm" >
                        <div className="w-2 h-2 bg-green-500 rounded-full" > </div>
                        < Typography variant="caption" color="muted" >
                            Account information is managed automatically
                        </Typography>
                    </FlexBox>
                </Box>
            </Box>
        </Card>
    )
}
