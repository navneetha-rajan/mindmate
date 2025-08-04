import axios from 'axios'

// Create axios instance
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to manually set token for testing
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  console.log('Token manually set:', token.substring(0, 20) + '...')
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mindmate-auth')
    if (token) {
      try {
        const authData = JSON.parse(token)
        console.log('Auth data from localStorage:', authData)
        
        // Check multiple possible token locations
        const userToken = authData.state?.token || authData.token || authData.state?.user?.token
        
        if (userToken) {
          config.headers.Authorization = `Bearer ${userToken}`
          console.log('Token added to request:', userToken.substring(0, 20) + '...')
        } else {
          console.log('No token found in auth data')
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    } else {
      console.log('No auth data in localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('mindmate-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
}

export const journalAPI = {
  create: (content: string) => api.post('/journal', { content }),
  getAll: (skip = 0, limit = 10) => 
    api.get(`/journal?skip=${skip}&limit=${limit}`),
  getById: (id: number) => api.get(`/journal/${id}`),
  delete: (id: number) => api.delete(`/journal/${id}`),
  getAnalysis: (id: number) => api.get(`/journal/analysis/${id}`),
  getWeeklySummary: () => api.get('/journal/weekly-summary'),
  getThemes: () => api.get('/journal/themes'),
  analyzeText: (content: string) => api.post('/journal/analyze-text', { content }),
}

export const conversationAPI = {
  start: (conversationType: string, theme?: string) =>
    api.post('/conversation/start', { conversation_type: conversationType, theme }),
  sendMessage: (message: string, sessionId: string, conversationType: string, theme?: string) =>
    api.post('/conversation/message', { 
      message, 
      session_id: sessionId, 
      conversation_type: conversationType, 
      theme 
    }),
  end: (sessionId: string) => api.post('/conversation/end', { session_id: sessionId }),
  getHistory: (skip = 0, limit = 20, sessionId?: string) =>
    api.get(`/conversation/history?skip=${skip}&limit=${limit}${sessionId ? `&session_id=${sessionId}` : ''}`),
  getSuggestions: () => api.get('/conversation/suggestions'),
  getSessions: () => api.get('/conversation/sessions'),
  getTypes: () => api.get('/conversation/types'),
  getThemes: () => api.get('/conversation/themes'),
}

export const insightsAPI = {
  // Mood tracking
  createMoodEntry: (moodData: {
    mood_score: number
    mood_label: string
    energy_level: number
    stress_level: number
    notes?: string
  }) => api.post('/insights/mood', moodData),
  getMoodEntries: (skip = 0, limit = 30) =>
    api.get(`/insights/mood?skip=${skip}&limit=${limit}`),
  getMoodAnalysis: (timePeriod = 'week') =>
    api.get(`/insights/mood-analysis?time_period=${timePeriod}`),

  // Habit tracking
  createHabitEntry: (habitData: {
    habit_name: string
    habit_value: number
    habit_unit: string
  }) => api.post('/insights/habits', habitData),
  getHabitEntries: (skip = 0, limit = 30) =>
    api.get(`/insights/habits?skip=${skip}&limit=${limit}`),
  getHabitCorrelations: () => api.get('/insights/habit-correlations'),

  // Pattern analysis
  getPatternAnalysis: () => api.get('/insights/patterns'),
  getWeeklySummary: () => api.get('/insights/weekly-summary'),
  getStats: () => api.get('/insights/stats'),
} 