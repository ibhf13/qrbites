import React from 'react'
import { Card, Typography, FileDropzone, FlexBox, Box } from '@/components/common'

interface LogoStepProps {
    onLogoChange: (file: File | null) => void
    existingLogoUrl?: string | null
}

const LogoStep: React.FC<LogoStepProps> = ({ onLogoChange, existingLogoUrl }) => {
    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            onLogoChange(files[0])
        }
    }

    return (
        <Box className="space-y-6">
            <Card variant="soft" padding="lg">
                <Typography variant="h4" gutterBottom>
                    Restaurant Logo
                </Typography>
                <Typography variant="body2" color="muted" gutterBottom>
                    Upload a logo for your restaurant. This will be displayed on your restaurant page and menu.
                </Typography>

                {existingLogoUrl && (
                    <Card variant="outlined" padding="md" className="mb-6">
                        <Typography variant="subtitle2" gutterBottom>
                            Current logo:
                        </Typography>
                        <FlexBox align="center" gap="md">
                            <img
                                src={existingLogoUrl}
                                alt="Restaurant Logo"
                                className="h-20 w-20 object-cover rounded-full border border-neutral-300 dark:border-neutral-600 shadow-sm"
                            />
                            <Typography variant="caption" color="muted">
                                Upload a new logo below to replace this one
                            </Typography>
                        </FlexBox>
                    </Card>
                )}

                <FileDropzone
                    onFileSelect={handleFileSelect}
                    title="Restaurant Logo"
                    subtitle="Upload a logo for your restaurant. This will be displayed on your restaurant page and menu."
                    helpText="Logo: max 2MB, recommended 512x512px"
                    accept={{
                        'image/jpeg': [],
                        'image/png': [],
                        'image/gif': [],
                        'image/webp': []
                    }}
                    maxSize={2 * 1024 * 1024}
                    multiple={false}
                />
            </Card>

            <Card variant="outlined" padding="md" className="bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
                <FlexBox align="start" gap="sm">
                    <Box className="flex-shrink-0">
                        <svg className="h-5 w-5 text-info-500 dark:text-info-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="default" className="text-info-800 dark:text-info-200">
                            <span className="font-semibold">Tip:</span> Upload a square logo image for best results. The logo will be displayed as a circular image on your restaurant page.
                        </Typography>
                    </Box>
                </FlexBox>
            </Card>
        </Box>
    )
}

export default LogoStep 