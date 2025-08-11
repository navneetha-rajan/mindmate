# MindMate 🧠

Your AI-powered mental wellness companion that helps you reflect, journal, and grow through intelligent conversations.

## What is MindMate?

MindMate is a privacy-focused AI companion that helps you understand your emotions, track your mood, and build better self-awareness through journaling and guided conversations. It's like having a thoughtful friend who remembers your journey and helps you see patterns you might miss.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (optional, for containerized setup)

### Get it running

1. **Clone and setup**
   ```bash
   git clone https://github.com/navneetha-rajan/mindmate.git
   cd mindmate
   ```

2. **Backend setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Copy and configure environment
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Run both servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   - App: http://localhost:3000
   - API docs: http://localhost:8000/docs

## 🛠️ Tech Stack

**Backend**
- FastAPI + SQLAlchemy
- OpenAI GPT-4o integration
- JWT authentication
- SQLite database

**Frontend**
- React 18 + TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Vite for fast development

**AI & Agents**
- LangChain framework
- Conversation memory
- Journal analysis
- Mood pattern recognition

## 🐳 Docker Setup (Alternative)

If you prefer containers:

```bash
docker-compose up --build
```

## 🤝 Contributing

Found a bug? Want to add a feature? Just:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request

## 📄 License

MIT License - feel free to use this for your own projects!
