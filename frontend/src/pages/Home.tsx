import { isAuthenticated } from '@api/auth'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()

    const handleLogin = () => {
        navigate('/login')
    }

    const handleRegister = () => {
        navigate('/register')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-primary-700 mb-6">
                    Welcome to QrBites
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Scan, discover, and enjoy your favorite restaurant menus
                </p>

                {!isAuthenticated() ? (
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleLogin}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
                        >
                            Login
                        </button>
                        <button
                            onClick={handleRegister}
                            className="w-full bg-white text-primary-600 border border-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition"
                        >
                            Register
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">You're logged in!</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home 