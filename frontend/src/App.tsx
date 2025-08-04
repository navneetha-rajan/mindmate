import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { setAuthToken } from './services/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Conversation from './pages/Conversation'
import Insights from './pages/Insights'
import Profile from './pages/Profile'

function App() {
  const { isAuthenticated, token } = useAuthStore()

  // Set the auth token when the app starts
  useEffect(() => {
    if (token) {
      setAuthToken(token)
      console.log('App started with token:', token.substring(0, 20) + '...')
    }
  }, [token])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/conversation" element={<Conversation />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default App 