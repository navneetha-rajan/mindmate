import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Brain },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Conversation', href: '/conversation', icon: MessageCircle },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const NavItem = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => {
    const isActive = location.pathname === item.href
    return (
      <Link
        to={item.href}
        onClick={() => mobile && setSidebarOpen(false)}
        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-warm-600 hover:bg-warm-50 hover:text-warm-900'
        }`}
      >
        <item.icon 
          className={`mr-3 h-5 w-5 transition-colors ${
            isActive ? 'text-primary-600' : 'text-warm-400 group-hover:text-warm-600'
          }`} 
        />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50/50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-warm-900/20 backdrop-blur-sm transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl animate-slide-in-right">
          <div className="flex h-16 items-center justify-between px-6 border-b border-warm-100">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-1.5 rounded-lg">
                <Brain className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-lg font-bold text-warm-900 tracking-tight">MindMate</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-warm-400 hover:text-warm-600 p-1 rounded-lg hover:bg-warm-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} mobile />
            ))}
          </nav>

          <div className="border-t border-warm-100 p-4 bg-warm-50/50">
            <div className="flex items-center mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-primary-700">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-warm-900">{user?.username}</p>
                <p className="text-xs text-warm-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-warm-600 hover:bg-white hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-warm-200 hover:shadow-sm"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-warm-100">
          <div className="flex h-20 items-center px-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-warm-900 tracking-tight">MindMate</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1.5 px-4 py-8">
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-wider">Menu</p>
            </div>
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}

            <div className="px-3 mt-8 mb-2">
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-wider">Wellness</p>
            </div>
            <div className="px-3 py-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl mx-3 border border-primary-100/50">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900">Daily Tip</span>
              </div>
              <p className="text-xs text-primary-700/80 leading-relaxed">
                Take a deep breath. Remember that progress is not linear.
              </p>
            </div>
          </nav>
          
          <div className="p-4 mx-4 mb-4 rounded-2xl bg-warm-50 border border-warm-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-white border border-warm-200 flex items-center justify-center shadow-sm text-primary-700 font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 truncate">{user?.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-warm-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 min-h-screen transition-all duration-300">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-warm-100 bg-white/80 backdrop-blur-md px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-warm-700 lg:hidden hover:bg-warm-50 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
               <span className="text-lg font-bold text-warm-900">MindMate</span>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-8 animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
