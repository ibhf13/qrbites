import React from 'react'
import { Box, Typography } from '@/components/common'

interface FormErrorProps {
    errors?: string | string[]
    className?: string
}

export const FormError: React.FC<FormErrorProps> = ({
    errors,
    className
}) => {
    if (!errors || (Array.isArray(errors) && errors.length === 0)) {
        return null
    }

    const errorList = Array.isArray(errors) ? errors : [errors]

    return (
        <Box mt="xs" className={className}>
            {errorList.map((error, index) => (
                <Typography
                    key={index}
                    variant="caption"
                    color="error"
                    role="alert"
                >
                    {error}
                </Typography>
            ))}
        </Box>
    )
}

export default FormError