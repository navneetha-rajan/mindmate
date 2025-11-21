import React, { useState, useEffect } from 'react'
import { insightsAPI } from '../services/api'
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  Zap, 
  AlertCircle,
  Calendar
} from 'lucide-react'
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
    mood_label: 'Neutral',
    energy_level: 5,
    stress_level: 5,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

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
    setSubmitting(true)
    try {
      await insightsAPI.createMoodEntry(moodData)
      setMoodEntries(prev => [{
        id: Date.now(),
        ...moodData,
        created_at: new Date().toISOString()
      }, ...prev])
      setMoodData({
        mood_score: 5,
        mood_label: 'Neutral',
        energy_level: 5,
        stress_level: 5,
        notes: ''
      })
      setShowMoodForm(false)
      toast.success('Mood tracked successfully!')
    } catch (error) {
      console.error('Error saving mood entry:', error)
      toast.error('Failed to save mood entry')
    } finally {
      setSubmitting(false)
    }
  }

  const getMoodLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Neutral'
    if (score >= 2) return 'Low'
    return 'Rough'
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '🤩'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😣'
  }
  
  const getMoodColor = (score: number) => {
     if (score >= 8) return 'text-emerald-600 bg-emerald-100'
     if (score >= 6) return 'text-teal-600 bg-teal-100'
     if (score >= 4) return 'text-amber-600 bg-amber-100'
     if (score >= 2) return 'text-orange-600 bg-orange-100'
     return 'text-rose-600 bg-rose-100'
   }

  const getBarColor = (score: number, type: 'energy' | 'stress') => {
    if (type === 'energy') {
        if (score >= 7) return 'bg-emerald-500'
        if (score >= 4) return 'bg-amber-400'
        return 'bg-rose-400'
    } else { // stress (lower is better usually, but here high score = high stress)
        if (score >= 7) return 'bg-rose-500'
        if (score >= 4) return 'bg-amber-400'
        return 'bg-emerald-500'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
         <div className="flex justify-between items-center">
             <div className="h-10 bg-warm-200 rounded-xl w-1/4"></div>
             <div className="h-10 bg-warm-200 rounded-xl w-32"></div>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-warm-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-warm-200 rounded-3xl"></div>
      </div>
    )
  }

  const averageMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
    : 0

  return (
    <div className="space-y-8 animate-fade-in min-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-warm-900 tracking-tight">Insights</h1>
          <p className="text-warm-600 mt-1">
            Visualize your emotional journey and patterns
          </p>
        </div>
        <button
          onClick={() => setShowMoodForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-lg shadow-primary-500/30"
        >
          <Plus className="h-5 w-5" />
          <span>Log Mood</span>
        </button>
      </div>

      {/* Mood Tracking Modal */}
      {showMoodForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-warm-100 flex justify-between items-center bg-warm-50/50">
              <h3 className="text-xl font-bold text-warm-900">How are you feeling?</h3>
              <button 
                onClick={() => setShowMoodForm(false)}
                className="text-warm-400 hover:text-warm-600 p-1 rounded-lg hover:bg-warm-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleMoodSubmit} className="p-6 space-y-8">
              {/* Mood Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-warm-700">Overall Mood</label>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getMoodColor(moodData.mood_score)}`}>
                        {moodData.mood_label}
                    </span>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-5xl filter drop-shadow-sm transition-all duration-300 hover:scale-110 cursor-default">
                        {getMoodEmoji(moodData.mood_score)}
                    </div>
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
                        className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-500 transition-all"
                    />
                    <div className="w-full flex justify-between text-xs text-warm-400 font-medium px-1">
                        <span>Rough</span>
                        <span>Neutral</span>
                        <span>Excellent</span>
                    </div>
                </div>
              </div>

              {/* Energy & Stress */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="flex items-center text-sm font-semibold text-warm-700">
                       <Zap className="h-4 w-4 text-amber-500 mr-1.5" /> Energy
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
                      className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
                    />
                    <div className="text-right text-xs font-medium text-warm-500">{moodData.energy_level}/10</div>
                </div>
                <div className="space-y-2">
                   <label className="flex items-center text-sm font-semibold text-warm-700">
                       <AlertCircle className="h-4 w-4 text-rose-500 mr-1.5" /> Stress
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
                      className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400"
                    />
                     <div className="text-right text-xs font-medium text-warm-500">{moodData.stress_level}/10</div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Quick Note (Optional)
                </label>
                <textarea
                  value={moodData.notes}
                  onChange={(e) => setMoodData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="input-field min-h-[100px] resize-none text-sm"
                  placeholder="What's influencing your mood right now?"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoodForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-warm-500">Average Mood</p>
            <p className="text-3xl font-bold text-warm-900 mt-1">
              {averageMood.toFixed(1)}<span className="text-lg text-warm-400 font-normal">/10</span>
            </p>
          </div>
          <div className="bg-primary-50 p-3 rounded-xl">
              <Activity className="h-6 w-6 text-primary-600" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-warm-500">Total Logs</p>
            <p className="text-3xl font-bold text-warm-900 mt-1">
              {moodEntries.length}
            </p>
          </div>
           <div className="bg-amber-50 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-warm-500">This Week</p>
            <p className="text-3xl font-bold text-warm-900 mt-1">
              {moodEntries.slice(0, 7).length}
            </p>
          </div>
           <div className="bg-violet-50 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Recent Logs List */}
      <div className="card overflow-hidden p-0">
        <div className="p-6 border-b border-warm-100 bg-warm-50/30">
             <h3 className="text-lg font-bold text-warm-900">Recent Logs</h3>
        </div>
        
        {moodEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-warm-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-warm-400" />
            </div>
            <p className="text-warm-900 font-medium">No mood logs yet</p>
            <p className="text-sm text-warm-500 mt-2 max-w-xs mx-auto">
              Tracking your mood helps identify triggers and patterns.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-warm-100">
            {moodEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-warm-50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl bg-white p-2 rounded-xl border border-warm-100 shadow-sm">
                        {getMoodEmoji(entry.mood_score)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                          <p className="font-bold text-warm-900">
                            {entry.mood_label} 
                          </p>
                          <span className="text-xs text-warm-400 font-medium px-1.5 py-0.5 bg-warm-100 rounded-md">
                              {entry.mood_score}/10
                          </span>
                      </div>
                      <div className="flex items-center text-xs text-warm-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} 
                        <span className="mx-1.5">•</span>
                        {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-warm-600 mt-2 leading-relaxed max-w-md">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 sm:border-l sm:border-warm-100 sm:pl-6">
                    <div className="space-y-1 min-w-[80px]">
                        <div className="flex justify-between text-xs font-medium text-warm-500 mb-1">
                            <span>Energy</span>
                            <span>{entry.energy_level}</span>
                        </div>
                        <div className="h-1.5 w-full bg-warm-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${getBarColor(entry.energy_level, 'energy')}`} 
                                style={{ width: `${entry.energy_level * 10}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-1 min-w-[80px]">
                        <div className="flex justify-between text-xs font-medium text-warm-500 mb-1">
                            <span>Stress</span>
                            <span>{entry.stress_level}</span>
                        </div>
                         <div className="h-1.5 w-full bg-warm-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${getBarColor(entry.stress_level, 'stress')}`} 
                                style={{ width: `${entry.stress_level * 10}%` }}
                            ></div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
