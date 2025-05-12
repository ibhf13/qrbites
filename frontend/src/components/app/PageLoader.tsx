import React from 'react'
import { LoadingSpinner } from '../common'

const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
    </div>
)

export default PageLoader 