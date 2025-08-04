import { useState, useEffect } from 'react'
import { journalAPI } from '../services/api'
import { BookOpen, Plus, Trash2, Eye, Calendar } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600 mt-2">
            Reflect on your thoughts, feelings, and experiences
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write New Entry</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field min-h-[120px] resize-none"
                placeholder="Write about your day, thoughts, feelings, or anything you'd like to reflect on..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
            <p className="text-gray-600 mb-4">
              Start your journaling journey by writing your first entry
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
            <div key={entry.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMoodEmoji(entry.mood_score)}</span>
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()} at{' '}
                      {new Date(entry.created_at).toLocaleTimeString()}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Mood: {entry.mood_label} ({entry.mood_score}/10)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">{entry.content}</p>
              </div>

              {(entry.themes?.length > 0 || entry.emotional_triggers?.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {entry.themes?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Themes:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.themes.map((theme, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.emotional_triggers?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Triggers:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.emotional_triggers.map((trigger, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 