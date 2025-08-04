from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Import all API routes
from app.api import journal, conversation, insights, auth
from app.models.database import engine, Base
from app.services.config import settings

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MindMate API",
    description="Your Autonomous Mental Wellness Companion",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(conversation.router, prefix="/api/conversation", tags=["Conversation"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])

# Basic routes
@app.get("/")
async def root():
    return {"message": "Welcome to MindMate API", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mindmate-api"}

@app.get("/api/test")
async def test_endpoint():
    return {"message": "API is working!", "timestamp": "2025-08-04T03:07:12.527625"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info") 