from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./mindmate.db"
    
    # LLM Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_MODEL: str = "gpt-4o"
    
    # Vector Database
    LANCE_DB_PATH: str = "./data/vector_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Audio Processing
    WHISPER_MODEL: str = "base"
    
    # Privacy Settings
    ENABLE_CLOUD_LOGGING: bool = False
    ENABLE_ANALYTICS: bool = False
    
    # Feature Flags
    ENABLE_VOICE_INPUT: bool = True
    ENABLE_MOOD_TRACKING: bool = True
    ENABLE_HABIT_CORRELATION: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings() 