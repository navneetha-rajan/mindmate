import React, { useState, useEffect, useRef } from 'react'
import { conversationAPI } from '../services/api'
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Settings, 
  Bot, 
  User as UserIcon,
  Sparkles,
  History,
  MoreHorizontal
} from 'lucide-react'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversationHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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
      const response = await conversationAPI.sendMessage(
        currentMessage,
        sessionId,
        conversationType,
        theme
      )
      
      const newMessage: Message = {
        id: Date.now().toString(),
        message: currentMessage,
        response: response.data.response || 'No response received',
        conversation_type: response.data.conversation_type || conversationType,
        theme: response.data.theme || theme || '',
        created_at: response.data.timestamp || new Date().toISOString()
      }
      
      setMessages(prev => [...prev, newMessage])
      setCurrentMessage('')
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
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-warm-900 tracking-tight">Conversation</h1>
          <p className="text-warm-600 mt-1">Your safe space for reflection and growth</p>
        </div>
        
        {sessionId && (
           <button
             onClick={() => {
               setSessionId(null)
               setMessages([])
             }}
             className="btn-secondary text-sm"
           >
             End Session
           </button>
        )}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-soft border border-warm-100 overflow-hidden relative">
          
          {!sessionId ? (
            // Setup Screen
            <div className="flex-1 flex items-center justify-center p-8 bg-warm-50/30">
              <div className="max-w-lg w-full space-y-8 text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <Sparkles className="h-10 w-10 text-primary-600" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-warm-900">Start a Session</h2>
                  <p className="text-warm-500 mt-2">Choose how you'd like to converse today.</p>
                </div>

                <div className="space-y-4 text-left bg-white p-6 rounded-2xl shadow-sm border border-warm-100">
                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      Conversation Style
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {conversationTypes.map((type) => (
                        <div 
                          key={type.value}
                          onClick={() => setConversationType(type.value)}
                          className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                            conversationType === type.value 
                              ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
                              : 'border-warm-200 hover:border-primary-300 hover:bg-warm-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                             <span className="font-medium text-warm-900">{type.label}</span>
                             {conversationType === type.value && <div className="w-2 h-2 rounded-full bg-primary-500"></div>}
                          </div>
                          <p className="text-xs text-warm-500 mt-1">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      Focus Theme (Optional)
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Open conversation...</option>
                      {themes.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={startNewConversation}
                    disabled={loading}
                    className="btn-primary w-full py-3 text-lg shadow-lg shadow-primary-500/30 mt-4"
                  >
                    {loading ? 'Connecting...' : 'Begin Conversation'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Chat Interface
            <>
              {/* Header */}
              <div className="h-16 border-b border-warm-100 flex items-center px-6 justify-between bg-white/80 backdrop-blur z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-warm-900">MindMate</p>
                    <p className="text-xs text-warm-500 capitalize">
                      {conversationType} • {theme || 'General'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-warm-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-warm-400 opacity-60">
                    <MessageCircle className="h-12 w-12 mb-2" />
                    <p>Say hello to start...</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className="space-y-6 animate-slide-up">
                      {/* User Message */}
                      <div className="flex justify-end items-end space-x-2">
                        <div className="max-w-[85%] lg:max-w-[75%]">
                          <div className="bg-primary-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-sm">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <p className="text-[10px] text-warm-400 text-right mt-1 mr-1">
                             You
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                           <UserIcon className="h-4 w-4 text-primary-700" />
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <div className="flex justify-start items-end space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                           <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="max-w-[85%] lg:max-w-[75%]">
                          <div className="bg-white border border-warm-200 text-warm-800 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.response}</p>
                          </div>
                          <p className="text-[10px] text-warm-400 ml-1 mt-1">MindMate</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {sending && (
                  <div className="flex justify-start items-end space-x-2 animate-pulse">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 opacity-50">
                        <Bot className="h-4 w-4 text-white" />
                     </div>
                     <div className="bg-warm-100 rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce animation-delay-200"></div>
                          <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce animation-delay-400"></div>
                        </div>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-warm-100">
                <form onSubmit={sendMessage} className="relative flex items-center gap-2 max-w-4xl mx-auto">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-12 py-3.5 bg-warm-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl transition-all text-warm-900 placeholder-warm-400 shadow-inner"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !currentMessage.trim()}
                    className="absolute right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-md"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* History Sidebar (Desktop) */}
        <div className="hidden lg:flex w-80 flex-col bg-white rounded-3xl shadow-soft border border-warm-100 overflow-hidden">
          <div className="p-4 border-b border-warm-100 bg-warm-50/50">
            <div className="flex items-center space-x-2 text-warm-700">
               <History className="h-4 w-4" />
               <h3 className="font-semibold">History</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {conversationHistory.length === 0 ? (
              <p className="text-center text-sm text-warm-400 py-8">No past conversations</p>
            ) : (
              conversationHistory.slice(0, 10).map((msg, index) => (
                <div key={index} className="p-3 rounded-xl hover:bg-warm-50 cursor-pointer transition-colors group border border-transparent hover:border-warm-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded-md">
                      {msg.conversation_type || 'General'}
                    </span>
                    <span className="text-[10px] text-warm-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-warm-600 line-clamp-2 group-hover:text-warm-900 transition-colors">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
