import React, { useState, useEffect } from 'react'
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
  Calendar,
  Sparkles,
  ArrowRight
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
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    loadStats()
    setGreeting(getGreeting())
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

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
      title: 'New Entry',
      description: 'Write about your day',
      icon: BookOpen,
      href: '/journal',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700'
    },
    {
      title: 'Chat now',
      description: 'Talk with MindMate',
      icon: MessageCircle,
      href: '/conversation',
      color: 'from-teal-500 to-emerald-500',
      bg: 'bg-teal-50',
      text: 'text-teal-700'
    },
    {
      title: 'Log Mood',
      description: 'How do you feel?',
      icon: Activity,
      href: '/insights',
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      text: 'text-violet-700'
    },
    {
      title: 'Insights',
      description: 'View your patterns',
      icon: BarChart3,
      href: '/insights',
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700'
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
    if (mood >= 7) return { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', text: 'Doing great!' }
    if (mood >= 5) return { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', text: 'Staying stable' }
    return { icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-100', text: 'Tough times' }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-warm-200 rounded-xl w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-warm-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  const moodTrend = stats ? getMoodTrend(stats.average_mood) : null

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-warm-900 tracking-tight">
            {greeting}, Friend.
          </h1>
          <p className="text-warm-600 mt-2 text-lg">
            Ready to check in with yourself today?
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-warm-500 uppercase tracking-wider">Current Streak</p>
          <div className="flex items-center justify-end space-x-2 text-primary-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-2xl font-bold">{stats?.streak_days || 0} days</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warm-500">Journal Entries</p>
              <p className="text-3xl font-bold text-warm-900 mt-2">{stats?.total_journal_entries || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-warm-400">
            <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full font-medium">Total</span>
            <span className="ml-2">Recorded memories</span>
          </div>
        </div>

        <div className="card hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warm-500">Mood Logs</p>
              <p className="text-3xl font-bold text-warm-900 mt-2">{stats?.total_mood_entries || 0}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-warm-400">
             <span className="bg-violet-100 text-violet-700 py-0.5 px-2 rounded-full font-medium">Tracked</span>
             <span className="ml-2">Emotional check-ins</span>
          </div>
        </div>

        <div className="card hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warm-500">Habits</p>
              <p className="text-3xl font-bold text-warm-900 mt-2">{stats?.total_habit_entries || 0}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
           <div className="mt-4 flex items-center text-xs text-warm-400">
             <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full font-medium">Active</span>
             <span className="ml-2">Daily routines</span>
          </div>
        </div>

        {/* Mood Card - Highlighted */}
        <div className="card relative overflow-hidden border-primary-200 bg-gradient-to-br from-white to-primary-50">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-primary-800">Average Mood</p>
              <div className="flex items-baseline space-x-2 mt-2">
                 <p className="text-3xl font-bold text-primary-900">{stats?.average_mood.toFixed(1) || '0.0'}</p>
                 <span className="text-sm text-primary-600">/ 10</span>
              </div>
            </div>
            <div className="text-4xl filter drop-shadow-sm animate-float">
              {getMoodEmoji(stats?.average_mood || 0)}
            </div>
          </div>
          {moodTrend && (
            <div className="mt-4 flex items-center space-x-2 relative z-10">
              <div className={`p-1 rounded-full ${moodTrend.bg}`}>
                <moodTrend.icon className={`h-3 w-3 ${moodTrend.color}`} />
              </div>
              <span className={`text-xs font-medium ${moodTrend.color}`}>
                {moodTrend.text}
              </span>
            </div>
          )}
          {/* Background decoration */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-100 rounded-full opacity-50 blur-2xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-warm-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-warm-100 shadow-soft hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${action.color}`}></div>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${action.bg} ${action.text} group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-warm-900 group-hover:text-primary-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-warm-500 mt-1">{action.description}</p>
                  </div>
                  <div className="bg-warm-50 p-1.5 rounded-full text-warm-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity / Motivation */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-warm-900 mb-6">Recent Activity</h2>
          <div className="card h-[calc(100%-3.5rem)] flex flex-col justify-center">
             {stats?.last_journal_date || stats?.last_mood_date ? (
               <div className="space-y-6">
                  {stats.last_journal_date && (
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-warm-900">Last Journal Entry</p>
                        <p className="text-xs text-warm-500 mt-1">
                          {new Date(stats.last_journal_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-warm-100"></div>

                  {stats.last_mood_date && (
                    <div className="flex items-start space-x-4">
                      <div className="bg-violet-100 p-2 rounded-full mt-1">
                         <Activity className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-warm-900">Last Mood Check</p>
                        <p className="text-xs text-warm-500 mt-1">
                          {new Date(stats.last_mood_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="text-center">
                 <div className="bg-warm-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Sparkles className="h-8 w-8 text-warm-400" />
                 </div>
                 <p className="text-warm-900 font-medium">Fresh Start</p>
                 <p className="text-sm text-warm-500 mt-2 px-4">
                   Your journey begins today. Try writing a journal entry!
                 </p>
                 <Link to="/journal" className="btn-primary mt-6 text-sm w-full">
                   Start Journaling
                 </Link>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
