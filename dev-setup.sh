#!/bin/bash

echo "🚀 Setting up MindMate development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.9+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🔧 Creating environment file..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env file"
else
    echo "ℹ️  backend/.env already exists"
fi

echo "🗄️  Creating data directories..."
mkdir -p backend/data
mkdir -p frontend/public

echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "1. Backend: cd backend && python3 -m uvicorn main:app --reload"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "docker-compose up --build"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs" 