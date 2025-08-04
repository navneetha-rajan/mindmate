# MindMate 🧠

Your Autonomous Mental Wellness Companion

## Overview

MindMate is a privacy-preserving, intelligent agent that helps users reflect on emotions, habits, and cognitive patterns using journaling, mood tracking, behavior modeling, and guided dialogue. Unlike traditional chatbots, it plans conversations over time, logs thematic concerns, and helps users build better awareness using self-supervised learning loops.

## 🌟 Key Features

### ✅ Currently Implemented

#### 🔐 Authentication System
- User registration and login with JWT tokens
- Secure password hashing with bcrypt
- Protected API endpoints with authentication middleware

#### 📝 Journal Management
- Create and store journal entries with AI analysis
- Extract emotional themes and triggers from entries
- View journal history and weekly summaries
- AI-powered insights on recurring patterns

#### 💬 Conversation Agent
- Interactive chat interface with AI companion
- Context-aware conversations with memory
- Start/end conversation sessions
- Conversation history tracking

#### 📊 Dashboard & Insights
- Overview of user activity and statistics
- Quick actions for common tasks
- Recent activity tracking
- User profile management

#### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light mode support
- Intuitive navigation between pages
- Real-time notifications and feedback

### 🚧 Planned Features

#### 📈 Advanced Analytics
- Mood tracking over time with visualizations
- Habit correlation analysis
- Personalized insights and recommendations

#### 🧠 Enhanced AI Agents
- Autonomous planner for conversation goals
- Socratic dialogue coaching
- CBT-style reflection prompts

#### 🔐 Privacy Features
- Local-only mode with offline AI
- End-to-end encryption
- Data export and deletion tools

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **LLM** | OpenAI GPT-4o (with fallback to keyword analysis) |
| **Agent Framework** | LangChain with ConversationBufferMemory |
| **Backend** | FastAPI with SQLAlchemy ORM |
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + Lucide React Icons |
| **State Management** | Zustand |
| **Database** | SQLite (local development) |
| **Authentication** | JWT with passlib[bcrypt] |
| **API Communication** | Axios with interceptors |
| **Build Tool** | Vite for frontend, uvicorn for backend |
| **Containerization** | Docker + Docker Compose |
| **Development** | Python venv, npm, hot reload |

## 🧪 Bonus Features

- ✍️ **Prompt Customizer**: Lets users tune the style of responses (casual, therapist-style, scientific, etc.)
- 📬 **Memory Reflection Digest**: Weekly email or downloadable PDF with visual insights
- ⏳ **"Future Self" Mode**: Write a letter to your future self — agent follows up later to reflect on it
- 🧩 **Custom Tool Plugins**: Integrate habits (e.g., Apple Health, Fitbit) and correlate with mood

## 🛠️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/navneetha-rajan/mindmate.git
   cd mindmate
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env and add your OpenAI API key
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

5. **Run the development servers**
   ```bash
   # Terminal 1 - Backend (from project root)
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2 - Frontend (from project root)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
mindmate/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── agents/         # AI agents (Journal, Conversation, Planner, Insights)
│   │   ├── api/           # API routes (auth, journal, conversation, insights)
│   │   ├── models/        # Database models and Pydantic schemas
│   │   └── services/      # Configuration and utilities
│   ├── requirements.txt    # Python dependencies
│   ├── main.py           # FastAPI application entry point
│   ├── .env              # Environment variables (not in git)
│   └── env.example       # Environment template
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Layout and shared components
│   │   ├── pages/        # Page components (Dashboard, Journal, etc.)
│   │   ├── services/     # API communication
│   │   └── stores/       # Zustand state management
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── vite.config.ts    # Vite configuration
├── docs/                 # Documentation
├── docker/              # Docker configuration
├── docker-compose.yml   # Multi-container setup
├── dev-setup.sh        # Development setup script
└── README.md           # This file
```

## 🔐 Privacy & Security

- All data is stored locally by default
- No cloud logging unless explicitly enabled
- End-to-end encryption for sensitive data
- Clear separation between user-facing and tool-calling layers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for mental wellness and personal growth
- Inspired by cognitive behavioral therapy and mindfulness practices
- Powered by modern AI/LLM technologies 