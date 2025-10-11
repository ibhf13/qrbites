import React from 'react'
import { Box, PageContainer, Paper, Grid, LoadingSpinner } from '@/components/common'
import { BasicInfoForm, PasswordChangeForm } from '../components/profile'
import { useAuthContext } from '../contexts/AuthContext'
import { ErrorDisplay } from '@/features/errorHandling/components'

const ProfilePage: React.FC = () => {
    const { user, loading, error } = useAuthContext()

    if (loading) {
        return (
            <PageContainer maxWidth="7xl" fullHeight>
                <Paper title="Profile Settings">
                    <Box centered fullHeight className="h-64">
                        <LoadingSpinner label="Loading profile..." />
                    </Box>
                </Paper>
            </PageContainer>
        )
    }

    if (error) {
        return (
            <PageContainer maxWidth="7xl" fullHeight>
                <Paper title="Profile Settings">
                    <ErrorDisplay
                        variant="banner"
                        message={error || 'Failed to load profile'}
                        title="Unable to Load Profile"
                    />
                </Paper>
            </PageContainer>
        )
    }

    if (!user) {
        return (
            <PageContainer maxWidth="7xl" fullHeight>
                <Paper title="Profile Settings">
                    <ErrorDisplay
                        variant="banner"
                        message="User information not available. Please try logging in again."
                        title="User Not Found"
                    />
                </Paper>
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="7xl" padding="sm">
            <Paper
                title="Profile Settings"
                subtitle="Manage your account information and security settings"
                className="bg-white dark:bg-neutral-900"
                headerClassName="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700"
                contentClassName="p-6"
            >
                <Grid cols={2} gap="xl" className="grid-cols-1 lg:grid-cols-2">
                    <BasicInfoForm user={user} />
                    <PasswordChangeForm />
                </Grid>
            </Paper>
        </PageContainer>
    )
}

export default ProfilePage