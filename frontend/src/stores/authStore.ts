import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

interface User {
  id: number
  username: string
  email: string
  created_at: string
  is_active: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: {
        id: 4,
        username: 'demo_user',
        email: 'demo@mindmate.com',
        created_at: '2025-08-04T03:07:12.527625',
        is_active: true,
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vX3VzZXIiLCJleHAiOjE3NTQyNzg2Mzl9.NIrbvr2PPWWM0jJN8Xe47kKAvYLonIw_UJIrAl5t5R0',
      isAuthenticated: true, // Demo user logged in by default
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { username, password })
          const { access_token } = response.data

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          // Get user info
          const userResponse = await api.get('/auth/me')
          const user = userResponse.data

          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Login failed',
          })
          throw error
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', {
            username,
            email,
            password,
          })

          set({
            isLoading: false,
            error: null,
          })

          return response.data
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Registration failed',
          })
          throw error
        }
      },

      logout: () => {
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'mindmate-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 