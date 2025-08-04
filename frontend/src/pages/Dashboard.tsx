import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { insightsAPI } from '../services/api'
import { 
  BookOpen, 
  MessageCircle, 
  BarChart3, 
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  total_journal_entries: number
  total_mood_entries: number
  total_habit_entries: number
  average_mood: number
  last_journal_date: string | null
  last_mood_date: string | null
  streak_days: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await insightsAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Write Journal Entry',
      description: 'Reflect on your day and track your thoughts',
      icon: BookOpen,
      href: '/journal',
      color: 'bg-blue-500',
    },
    {
      title: 'Start Conversation',
      description: 'Have a guided conversation with MindMate',
      icon: MessageCircle,
      href: '/conversation',
      color: 'bg-green-500',
    },
    {
      title: 'Track Mood',
      description: 'Record your current mood and energy',
      icon: Activity,
      href: '/insights',
      color: 'bg-purple-500',
    },
    {
      title: 'View Insights',
      description: 'See your patterns and progress',
      icon: BarChart3,
      href: '/insights',
      color: 'bg-orange-500',
    },
  ]

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊'
    if (mood >= 6) return '🙂'
    if (mood >= 4) return '😐'
    if (mood >= 2) return '😔'
    return '😢'
  }

  const getMoodTrend = (mood: number) => {
    if (mood >= 7) return { icon: TrendingUp, color: 'text-green-600', text: 'Great mood!' }
    if (mood >= 5) return { icon: Activity, color: 'text-yellow-600', text: 'Stable mood' }
    return { icon: TrendingDown, color: 'text-red-600', text: 'Could be better' }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const moodTrend = stats ? getMoodTrend(stats.average_mood) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your mental wellness overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_journal_entries || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mood Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_mood_entries || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Habit Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_habit_entries || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Streak Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.streak_days || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Overview */}
      {stats && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Overview</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{getMoodEmoji(stats.average_mood)}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.average_mood.toFixed(1)}/10
                </p>
                <p className="text-sm text-gray-600">Average mood</p>
              </div>
            </div>
            {moodTrend && (
              <div className="flex items-center space-x-2">
                <moodTrend.icon className={`h-5 w-5 ${moodTrend.color}`} />
                <span className={`text-sm font-medium ${moodTrend.color}`}>
                  {moodTrend.text}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="card hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-primary-600">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats?.last_journal_date && (
            <div className="flex items-center space-x-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Last journal entry: {new Date(stats.last_journal_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {stats?.last_mood_date && (
            <div className="flex items-center space-x-3">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">
                Last mood check: {new Date(stats.last_mood_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {!stats?.last_journal_date && !stats?.last_mood_date && (
            <p className="text-sm text-gray-500">No recent activity. Start by writing a journal entry!</p>
          )}
        </div>
      </div>
    </div>
  )
} 