import { useState, useEffect } from 'react'
import { conversationAPI } from '../services/api'
import { MessageCircle, Send, Plus, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  message: string
  response: string
  conversation_type: string
  theme: string
  created_at: string
}

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationType, setConversationType] = useState('general')
  const [theme, setTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])

  useEffect(() => {
    loadConversationHistory()
  }, [])

  const loadConversationHistory = async () => {
    try {
      const response = await conversationAPI.getHistory()
      setConversationHistory(response.data)
    } catch (error) {
      console.error('Error loading conversation history:', error)
    }
  }

  const startNewConversation = async () => {
    setLoading(true)
    try {
      const response = await conversationAPI.start(conversationType, theme)
      setSessionId(response.data.session_id)
      // Clear current session messages when starting new conversation
      setMessages([])
      toast.success('New conversation started!')
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Failed to start conversation')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMessage.trim() || !sessionId) return

    setSending(true)
    try {
      console.log('Sending message:', currentMessage)
      const response = await conversationAPI.sendMessage(
        currentMessage,
        sessionId,
        conversationType,
        theme
      )
      
      console.log('Response received:', response.data)
      
      // Create a new message object from the response
      const newMessage: Message = {
        id: Date.now().toString(), // Generate a temporary ID
        message: currentMessage,
        response: response.data.response || 'No response received',
        conversation_type: response.data.conversation_type || conversationType,
        theme: response.data.theme || theme || '',
        created_at: response.data.timestamp || new Date().toISOString()
      }
      
      console.log('New message object:', newMessage)
      setMessages(prev => [...prev, newMessage]) // Add to end for chronological order
      setCurrentMessage('')
      
      // Reload conversation history after sending message
      loadConversationHistory()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const conversationTypes = [
    { value: 'general', label: 'General Support', description: 'Warm, empathetic conversation' },
    { value: 'socratic', label: 'Socratic Dialogue', description: 'Thoughtful questions for reflection' },
    { value: 'cbt', label: 'CBT Style', description: 'Cognitive behavioral therapy approach' },
  ]

  const themes = [
    'personal growth',
    'relationships',
    'work and career',
    'stress and anxiety',
    'self-esteem',
    'goals and motivation',
    'emotional awareness',
    'mindfulness',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversation</h1>
        <p className="text-gray-600 mt-2">
          Have a guided conversation with MindMate
        </p>
      </div>

      {/* Conversation Setup */}
      {!sessionId && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start a New Conversation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Type
              </label>
              <select
                value={conversationType}
                onChange={(e) => setConversationType(e.target.value)}
                className="input-field"
              >
                {conversationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme (Optional)
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a theme...</option>
                {themes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={startNewConversation}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Starting...' : 'Start Conversation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Conversation */}
      {sessionId && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Conversation</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {conversationType} • {theme || 'General'}
              </span>
              <button
                onClick={() => {
                  setSessionId(null)
                  setMessages([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Start the conversation by sending a message</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                      <p className="text-sm">{msg.message || 'Message not available'}</p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                      <p className="text-sm">{msg.response || 'Response not available'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !currentMessage.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            {conversationHistory.slice(0, 5).map((msg, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Unknown date'} at{' '}
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'Unknown time'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {(msg.message || 'No message').substring(0, 100)}...
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {msg.conversation_type || 'general'} • {msg.theme || 'General'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 