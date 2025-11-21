import React, { useState, useEffect } from 'react'
import { journalAPI } from '../services/api'
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  X, 
  Smile, 
  Frown, 
  Meh, 
  PenLine 
} from 'lucide-react'
import toast from 'react-hot-toast'

interface JournalEntry {
  id: number
  content: string
  mood_score: number
  mood_label: string
  themes: string[]
  emotional_triggers: string[]
  created_at: string
  updated_at: string
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const response = await journalAPI.getAll()
      setEntries(response.data)
    } catch (error) {
      console.error('Error loading entries:', error)
      toast.error('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Please write something in your journal entry')
      return
    }

    setSubmitting(true)
    try {
      const response = await journalAPI.create(content)
      setEntries([response.data, ...entries])
      setContent('')
      setShowForm(false)
      toast.success('Journal entry created successfully!')
    } catch (error) {
      console.error('Error creating entry:', error)
      toast.error('Failed to create journal entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      await journalAPI.delete(id)
      setEntries(entries.filter(entry => entry.id !== id))
      toast.success('Entry deleted successfully')
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊'
    if (mood >= 6) return '🙂'
    if (mood >= 4) return '😐'
    if (mood >= 2) return '😔'
    return '😢'
  }
  
  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (mood >= 6) return 'bg-teal-100 text-teal-700 border-teal-200'
    if (mood >= 4) return 'bg-amber-100 text-amber-700 border-amber-200'
    if (mood >= 2) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-rose-100 text-rose-700 border-rose-200'
  }

  return (
    <div className="space-y-8 animate-fade-in min-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-warm-900 tracking-tight">Journal</h1>
          <p className="text-warm-600 mt-1">Capture your journey, one thought at a time.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-lg shadow-primary-500/30"
        >
          <Plus className="h-5 w-5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Write New Entry Modal/Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-warm-100 flex justify-between items-center bg-warm-50/50">
              <h3 className="text-xl font-bold text-warm-900 flex items-center">
                <PenLine className="mr-2 h-5 w-5 text-primary-600" />
                New Entry
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-warm-400 hover:text-warm-600 p-1 rounded-lg hover:bg-warm-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="mb-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[300px] p-6 text-lg leading-relaxed text-warm-900 placeholder-warm-300 bg-warm-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary-200 focus:ring-2 focus:ring-primary-100 resize-none transition-all outline-none"
                  placeholder="How are you feeling right now? What's on your mind? Let it all out..."
                  autoFocus
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-warm-400">
                  {content.length} characters
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="btn-primary min-w-[120px]"
                  >
                    {submitting ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-warm-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        /* Entries Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {entries.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-warm-200">
              <div className="bg-warm-50 p-4 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-warm-400" />
              </div>
              <h3 className="text-xl font-medium text-warm-900 mb-2">Your journal is empty</h3>
              <p className="text-warm-500 max-w-md mx-auto mb-6">
                Writing down your thoughts is a powerful way to understand yourself better.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Write Your First Entry
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <div 
                key={entry.id} 
                className="group bg-white rounded-3xl p-6 border border-warm-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(entry.mood_score)}`}>
                      <span className="text-lg">{getMoodEmoji(entry.mood_score)}</span>
                      <span>{entry.mood_label}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-6">
                  <p className="text-warm-800 whitespace-pre-wrap leading-relaxed line-clamp-6 group-hover:line-clamp-none transition-all">
                    {entry.content}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="mt-auto pt-4 border-t border-warm-50">
                   <div className="flex flex-wrap gap-2 mb-3">
                      {entry.themes?.map((theme, i) => (
                        <span key={i} className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-md">
                          #{theme}
                        </span>
                      ))}
                   </div>
                   <div className="flex items-center text-xs text-warm-400 font-medium">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {new Date(entry.created_at).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      <span className="mx-2">•</span>
                      {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
