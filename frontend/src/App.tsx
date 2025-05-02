import ProtectedRoute from '@components/auth/ProtectedRoute'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

// Lazy load pages
const Home = lazy(() => import('@pages/Home'))
const Login = lazy(() => import('@pages/Login'))
const Register = lazy(() => import('@pages/Register'))
const Dashboard = lazy(() => import('@pages/Dashboard'))
const NotFound = lazy(() => import('@pages/NotFound'))

// For demonstration, creating simple loading components
const Loading = () => <div className="flex justify-center items-center h-screen">Loading...</div>

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Suspense>
  )
}

export default App
