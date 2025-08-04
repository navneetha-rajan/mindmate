import { useAuthStore } from '../stores/authStore'
import { User, Shield, Settings, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy & Security</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Data stored locally</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">End-to-end encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">No cloud logging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">MindMate Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Journaling</h4>
            <p className="text-sm text-blue-700">
              AI-powered journal analysis with mood tracking and theme extraction
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Conversations</h4>
            <p className="text-sm text-green-700">
              Socratic dialogues and CBT-style guided conversations
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Insights</h4>
            <p className="text-sm text-purple-700">
              Mood trends, habit correlations, and pattern analysis
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Privacy</h4>
            <p className="text-sm text-orange-700">
              Local data storage with optional cloud sync
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Autonomous</h4>
            <p className="text-sm text-red-700">
              Self-supervised learning and adaptive conversations
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Wellness</h4>
            <p className="text-sm text-indigo-700">
              Mental health focused with evidence-based approaches
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Manage preferences and notifications</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Privacy</p>
                <p className="text-sm text-gray-600">Manage data and privacy settings</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 text-left border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Sign Out</p>
                <p className="text-sm text-red-600">Log out of your account</p>
              </div>
            </div>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">About MindMate</h3>
        <div className="prose prose-sm text-gray-600">
          <p>
            MindMate is your autonomous mental wellness companion, designed to help you reflect on emotions, 
            habits, and cognitive patterns through intelligent journaling and guided conversations.
          </p>
          <p>
            Built with privacy in mind, all your data is stored locally and never shared without your explicit consent. 
            The AI agents work together to provide personalized insights and support for your mental wellness journey.
          </p>
        </div>
      </div>
    </div>
  )
} 