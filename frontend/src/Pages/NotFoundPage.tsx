import React from 'react'
import { Link } from 'react-router-dom'

interface NotFoundPageProps { }

const NotFoundPage: React.FC<NotFoundPageProps> = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-card text-center animate-fade-in">
                <div className="mb-6">
                    <h1 className="text-6xl font-display font-bold text-primary-600">404</h1>
                    <h2 className="text-2xl font-display font-semibold text-neutral-800 mt-4">Page Not Found</h2>
                </div>

                <p className="text-neutral-600 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg 
            transition duration-300 ease-in-out hover:bg-primary-700 focus:outline-none 
            focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                    >
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2.5 bg-neutral-200 text-neutral-800 font-medium rounded-lg 
            transition duration-300 ease-in-out hover:bg-neutral-300 focus:outline-none 
            focus:ring-2 focus:ring-neutral-300 focus:ring-opacity-50"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage 