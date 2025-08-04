# MindMate - Startup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Virtual environment (recommended)

### Setup

1. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```

2. **Start the backend server:**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Configuration

### Backend Environment
Copy the example environment file:
```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` to configure:
- OpenAI API key (for LLM features)
- Database settings
- Security settings

### Frontend Configuration
The frontend is configured to proxy API requests to the backend automatically.

## 🧪 Testing

Run the test script to verify setup:
```bash
python test_setup.py
```

## 📁 Project Structure

```
mindmate/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── agents/         # LLM agents
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── api/           # API routes
│   ├── main.py            # FastAPI app entry point
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── stores/       # State management
│   └── package.json      # Node.js dependencies
└── README.md             # Project documentation
```

## 🌟 Features

### ✅ Implemented
- [x] User authentication (register/login)
- [x] Journal entries with AI analysis
- [x] Mood tracking and insights
- [x] Socratic dialogue conversations
- [x] Dashboard with overview
- [x] Modern React frontend with Tailwind CSS
- [x] FastAPI backend with SQLAlchemy
- [x] LLM integration for analysis
- [x] Privacy-focused local storage

### 🚧 In Progress
- [ ] Voice input processing
- [ ] Advanced habit correlation
- [ ] Weekly planning agent
- [ ] PDF report generation
- [ ] Mobile app (Tauri)

### 📋 Planned
- [ ] Offline mode with Ollama
- [ ] Advanced analytics
- [ ] Integration with health apps
- [ ] Multi-language support
- [ ] Advanced privacy controls

## 🔐 Privacy & Security

- All data stored locally by default
- No cloud logging unless explicitly enabled
- End-to-end encryption for sensitive data
- Clear separation between user-facing and tool-calling layers
- Optional cloud sync with user consent

## 🛠️ Development

### Backend Development
```bash
cd backend
source ../venv/bin/activate
python -m uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

## 🐳 Docker Deployment

Use Docker Compose for easy deployment:
```bash
docker-compose up --build
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Journal
- `POST /api/journal/` - Create journal entry
- `GET /api/journal/` - Get journal entries
- `GET /api/journal/{id}` - Get specific entry
- `DELETE /api/journal/{id}` - Delete entry

### Conversation
- `POST /api/conversation/start` - Start conversation
- `POST /api/conversation/message` - Send message
- `GET /api/conversation/history` - Get conversation history

### Insights
- `POST /api/insights/mood` - Create mood entry
- `GET /api/insights/mood` - Get mood entries
- `GET /api/insights/mood-analysis` - Get mood analysis
- `GET /api/insights/weekly-summary` - Get weekly summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ for mental wellness and personal growth
- Inspired by cognitive behavioral therapy and mindfulness practices
- Powered by modern AI/LLM technologies 