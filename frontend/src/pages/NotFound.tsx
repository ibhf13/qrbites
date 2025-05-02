import { Link } from 'react-router-dom'

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                <h1 className="text-4xl font-bold text-primary-700 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition"
                >
                    Go Home
                </Link>
            </div>
        </div>
    )
}

export default NotFound 