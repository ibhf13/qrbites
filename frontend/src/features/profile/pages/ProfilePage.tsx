import React from 'react'
import { Box, PageContainer, Paper, Button, ErrorDisplay, FlexBox, Grid } from '@/components/common'
import { LoadingSpinner } from '@/components/common/feedback'
import { useProfile } from '@/features/profile/hooks'
import { useProfileForm } from '@/features/profile/hooks/useProfileForm'
import { BasicInfoForm, PasswordChangeForm } from '@/features/profile/components/forms'

const ProfilePage: React.FC = () => {
    const { userInfo, isLoading, isError, error } = useProfile()
    const { form, onSubmit, isSubmitting, submitError } = useProfileForm()

    if (isLoading) {
        return (
            <PageContainer maxWidth="7xl" fullHeight>
                <Paper title="Profile Settings">
                    <Box centered fullHeight className="h-64">
                        <LoadingSpinner />
                    </Box>
                </Paper>
            </PageContainer>
        )
    }

    if (isError) {
        return (
            <PageContainer maxWidth="7xl" fullHeight>
                <Paper title="Profile Settings">
                    <ErrorDisplay
                        variant="banner"
                        message={error?.message || 'Failed to load profile'}
                    />
                </Paper>
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="7xl" padding='sm'>
            <Paper
                title="Profile Settings"
                subtitle="Manage your account information and security settings"
                className="bg-white dark:bg-neutral-900"
                headerClassName='px-4 py-2'
                contentClassName='px-2 md:px-3'

            >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Grid cols={2} gap="xl" className="grid-cols-1 lg:grid-cols-2 pt-4">
                        <BasicInfoForm
                            email={userInfo?.email}
                            register={form.register}
                            errors={form.formState.errors}
                        />

                        <PasswordChangeForm
                            register={form.register}
                            errors={form.formState.errors}
                        />
                    </Grid>

                    {submitError && (
                        <ErrorDisplay
                            variant="banner"
                            message={submitError?.message || 'Failed to update profile'}
                        />
                    )}

                    <FlexBox justify="end">
                        <Button
                            type="submit"
                            disabled={!form.formState.isDirty || isSubmitting}
                            isLoading={isSubmitting}
                            size="lg"
                        >
                            Save Changes
                        </Button>
                    </FlexBox>
                </form>
            </Paper>
        </PageContainer>
    )
}

export default ProfilePage 