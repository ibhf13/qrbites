import { FlexBox } from '@/components/common/layout'
import React, { ReactNode } from 'react'
import Header from './Header'

interface MainLayoutProps {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
}) => {
    return (
        <FlexBox
            direction="col"
            className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
        >
            <Header />
            <main
                role="main"
                aria-label="Main content"
                className="flex-1 bg-neutral-50 dark:bg-neutral-900"
            >
                {children}
            </main>
        </FlexBox>
    )
}

export default MainLayout 