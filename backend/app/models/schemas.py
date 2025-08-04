from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Journal schemas
class JournalEntryBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntry(JournalEntryBase):
    id: int
    user_id: int
    mood_score: Optional[float] = None
    mood_label: Optional[str] = None
    themes: Optional[str] = None
    emotional_triggers: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class JournalAnalysis(BaseModel):
    mood_score: float
    mood_label: str
    themes: List[str]
    emotional_triggers: List[str]
    sentiment_trend: str
    key_insights: List[str]

# Conversation schemas
class ConversationBase(BaseModel):
    message: str
    conversation_type: str = "general"
    theme: Optional[str] = None

class ConversationCreate(ConversationBase):
    session_id: str

class Conversation(ConversationBase):
    id: int
    user_id: int
    session_id: str
    response: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Mood tracking schemas
class MoodEntryBase(BaseModel):
    mood_score: float = Field(..., ge=0, le=10)
    mood_label: str
    energy_level: int = Field(..., ge=1, le=10)
    stress_level: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None

class MoodEntryCreate(MoodEntryBase):
    pass

class MoodEntry(MoodEntryBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Habit tracking schemas
class HabitEntryBase(BaseModel):
    habit_name: str
    habit_value: float
    habit_unit: str

class HabitEntryCreate(HabitEntryBase):
    pass

class HabitEntry(HabitEntryBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Weekly planning schemas
class WeeklyPlanBase(BaseModel):
    themes: List[str]
    goals: List[str]

class WeeklyPlanCreate(WeeklyPlanBase):
    week_start: datetime

class WeeklyPlan(WeeklyPlanBase):
    id: int
    user_id: int
    week_start: datetime
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Insights schemas
class MoodInsights(BaseModel):
    average_mood: float
    mood_trend: str
    mood_distribution: Dict[str, int]
    energy_correlation: float
    stress_correlation: float
    weekly_patterns: List[Dict[str, Any]]

class ThemeInsights(BaseModel):
    recurring_themes: List[str]
    theme_frequency: Dict[str, int]
    emotional_triggers: List[str]
    trigger_frequency: Dict[str, int]

class HabitCorrelation(BaseModel):
    habit_name: str
    correlation_with_mood: float
    correlation_with_energy: float
    correlation_with_stress: float

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# API Response schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int 