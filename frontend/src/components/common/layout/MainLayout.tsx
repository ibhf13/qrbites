import { MobileNav } from '@/components/common/navigation'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import React, { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <NavigationProvider>
            <NotificationProvider>
                <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex flex-1 overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-grow overflow-hidden">
                            <Header />
                            <main
                                className="p-4 sm:p-6 overflow-auto flex-grow"
                                role="main"
                                aria-label="Main content"
                            >
                                {children}
                            </main>
                        </div>
                    </div>
                    <MobileNav />
                </div>
            </NotificationProvider>
        </NavigationProvider>
    )
}

export default MainLayout 