import { useState, useEffect } from 'react'
import { insightsAPI } from '../services/api'
import { BarChart3, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface MoodEntry {
  id: number
  mood_score: number
  mood_label: string
  energy_level: number
  stress_level: number
  notes: string
  created_at: string
}

export default function Insights() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoodForm, setShowMoodForm] = useState(false)
  const [moodData, setMoodData] = useState({
    mood_score: 5,
    mood_label: 'neutral',
    energy_level: 5,
    stress_level: 5,
    notes: ''
  })

  useEffect(() => {
    loadMoodEntries()
  }, [])

  const loadMoodEntries = async () => {
    try {
      const response = await insightsAPI.getMoodEntries()
      setMoodEntries(response.data)
    } catch (error) {
      console.error('Error loading mood entries:', error)
      toast.error('Failed to load mood data')
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await insightsAPI.createMoodEntry(moodData)
      setMoodEntries(prev => [{
        id: Date.now(),
        ...moodData,
        created_at: new Date().toISOString()
      }, ...prev])
      setMoodData({
        mood_score: 5,
        mood_label: 'neutral',
        energy_level: 5,
        stress_level: 5,
        notes: ''
      })
      setShowMoodForm(false)
      toast.success('Mood entry saved!')
    } catch (error) {
      console.error('Error saving mood entry:', error)
      toast.error('Failed to save mood entry')
    }
  }

  const getMoodLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Neutral'
    if (score >= 2) return 'Poor'
    return 'Very Poor'
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-blue-600 bg-blue-100'
    if (score >= 4) return 'text-yellow-600 bg-yellow-100'
    if (score >= 2) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

  const averageMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
    : 0

  const recentEntries = moodEntries.slice(0, 7)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-600 mt-2">
            Track your mood and discover patterns
          </p>
        </div>
        <button
          onClick={() => setShowMoodForm(!showMoodForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Activity className="h-4 w-4" />
          <span>Track Mood</span>
        </button>
      </div>

      {/* Mood Tracking Form */}
      {showMoodForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling?</h3>
          <form onSubmit={handleMoodSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood Score (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodData.mood_score}
                onChange={(e) => {
                  const score = parseInt(e.target.value)
                  setMoodData(prev => ({
                    ...prev,
                    mood_score: score,
                    mood_label: getMoodLabel(score)
                  }))
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Current: {moodData.mood_score}/10 - {moodData.mood_label}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.energy_level}
                  onChange={(e) => setMoodData(prev => ({
                    ...prev,
                    energy_level: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Current: {moodData.energy_level}/10
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.stress_level}
                  onChange={(e) => setMoodData(prev => ({
                    ...prev,
                    stress_level: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Current: {moodData.stress_level}/10
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={moodData.notes}
                onChange={(e) => setMoodData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                className="input-field"
                placeholder="Any thoughts about your mood today?"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMoodForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mood Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageMood.toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {moodEntries.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentEntries.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Mood Entries */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
        {moodEntries.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No mood entries yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start tracking your mood to see insights
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMoodEmoji(entry.mood_score)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.mood_label} ({entry.mood_score}/10)
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Energy: {entry.energy_level}/10</span>
                    <span>Stress: {entry.stress_level}/10</span>
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 