# MindMate 🧠

Your Autonomous Mental Wellness Companion

## Overview

MindMate is a privacy-preserving, intelligent agent that helps users reflect on emotions, habits, and cognitive patterns using journaling, mood tracking, behavior modeling, and guided dialogue. Unlike traditional chatbots, it plans conversations over time, logs thematic concerns, and helps users build better awareness using self-supervised learning loops.

## 🌟 Key Features

### 📝 Reflective Journaling Agent
- Analyzes user journal entries (text or voice)
- Extracts mood, recurring themes, emotional triggers
- Stores a compressed emotional timeline for weekly reports

### 🧩 Autonomous Planner Agent
- Plans personalized weekly conversation goals
- Chooses themes: e.g., "procrastination", "relationships", "imposter syndrome"
- Adjusts based on sentiment trend detection or recurring cognitive biases

### 🧠 Socratic Dialogue Coach
- Conducts guided conversations — not advice, but nudges thinking
- Uses open-ended questions + memory to track how user responds over time
- Offers CBT-style reflections (optionally) based on patterns

### 📈 Mood & Habit Insights
- Graph of sentiment/emotion/mood over time
- Correlates entries with behaviors (if tracked: e.g., sleep, screen time)
- "What changed since last time?" agent that compares entries

### 🔐 Privacy & Local Mode
- Optionally runs entirely offline (e.g., via LM Studio + Ollama + SQLite)
- No cloud logging by default
- Clearly separated tool-calling vs. user-facing agent layers

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| LLM | GPT-4 / Claude / Mixtral / Mistral (via Ollama) |
| Agent Framework | LangGraph / CrewAI / semantic memory with LanceDB |
| Backend | FastAPI |
| Frontend | React + Tailwind CSS |
| Voice | OpenAI Whisper or Deepgram |
| Database | SQLite for local mode, Postgres for cloud |
| Visuals | Charts via D3.js / Plotly for mood & topic tracking |
| Local Deployment | Docker, optional Hugging Face Space or Replit |

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
   git clone <repository-url>
   cd mindmate
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Run the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

```
mindmate/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── agents/         # LLM agents and workflows
│   │   ├── models/         # Data models and schemas
│   │   ├── services/       # Business logic
│   │   └── api/           # API routes
│   ├── tests/             # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── docs/                 # Documentation
└── docker/              # Docker configuration
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