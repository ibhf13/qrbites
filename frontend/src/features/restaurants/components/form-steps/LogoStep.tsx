import React from 'react'
import { Card, Typography, FileDropzone, Box } from '@/components/common'

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
        <Box className="space-y-4">
            <Card variant="outlined" padding="sm" className="bg-white dark:bg-neutral-900">
                <Typography variant="subheading" className="mb-2">
                    Restaurant Logo
                </Typography>

                <FileDropzone
                    onFileSelect={handleFileSelect}
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
                    initialPreview={existingLogoUrl || undefined}
                    showPreview={true}
                />
            </Card>


        </Box>
    )
}

export default LogoStep 