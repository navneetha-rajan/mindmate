from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from app.models.database import get_db, MoodEntry, HabitEntry, JournalEntry, User
from app.models.schemas import MoodEntryCreate, HabitEntryCreate
from app.agents.insights_agent import InsightsAgent
from app.api.auth import get_current_user

router = APIRouter()
insights_agent = InsightsAgent()

# Mood tracking endpoints
@router.post("/mood", response_model=dict)
async def create_mood_entry(
    mood_entry: MoodEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new mood entry."""
    try:
        db_entry = MoodEntry(
            user_id=current_user.id,
            mood_score=mood_entry.mood_score,
            mood_label=mood_entry.mood_label,
            energy_level=mood_entry.energy_level,
            stress_level=mood_entry.stress_level,
            notes=mood_entry.notes
        )
        
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        
        return {
            "message": "Mood entry created successfully",
            "entry_id": db_entry.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating mood entry: {str(e)}")

@router.get("/mood", response_model=List[dict])
async def get_mood_entries(
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's mood entries with pagination."""
    entries = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id
    ).order_by(MoodEntry.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": entry.id,
            "mood_score": entry.mood_score,
            "mood_label": entry.mood_label,
            "energy_level": entry.energy_level,
            "stress_level": entry.stress_level,
            "notes": entry.notes,
            "created_at": entry.created_at.isoformat()
        }
        for entry in entries
    ]

# Habit tracking endpoints
@router.post("/habits", response_model=dict)
async def create_habit_entry(
    habit_entry: HabitEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new habit entry."""
    try:
        db_entry = HabitEntry(
            user_id=current_user.id,
            habit_name=habit_entry.habit_name,
            habit_value=habit_entry.habit_value,
            habit_unit=habit_entry.habit_unit
        )
        
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        
        return {
            "message": "Habit entry created successfully",
            "entry_id": db_entry.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating habit entry: {str(e)}")

@router.get("/habits", response_model=List[dict])
async def get_habit_entries(
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's habit entries with pagination."""
    entries = db.query(HabitEntry).filter(
        HabitEntry.user_id == current_user.id
    ).order_by(HabitEntry.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": entry.id,
            "habit_name": entry.habit_name,
            "habit_value": entry.habit_value,
            "habit_unit": entry.habit_unit,
            "created_at": entry.created_at.isoformat()
        }
        for entry in entries
    ]

# Mood analysis endpoints
@router.get("/mood-analysis")
async def get_mood_insights(
    time_period: str = "week",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mood analysis and insights."""
    try:
        # Calculate date range
        if time_period == "week":
            start_date = datetime.utcnow() - timedelta(days=7)
        elif time_period == "month":
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=7)
        
        # Get mood entries for the period
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id,
            MoodEntry.created_at >= start_date
        ).order_by(MoodEntry.created_at.desc()).all()
        
        # Convert to list of dicts for analysis
        mood_data = []
        for entry in mood_entries:
            mood_data.append({
                "mood_score": entry.mood_score,
                "mood_label": entry.mood_label,
                "energy_level": entry.energy_level,
                "stress_level": entry.stress_level,
                "created_at": entry.created_at.isoformat()
            })
        
        # Generate insights
        insights = await insights_agent.generate_mood_insights(mood_data, time_period)
        
        return {
            "insights": insights,
            "total_entries": len(mood_entries),
            "period": time_period
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting mood insights: {str(e)}")

# Habit correlation analysis
@router.get("/habit-correlations")
async def get_habit_correlations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get habit correlations with mood and other factors."""
    try:
        # Get recent mood and habit entries
        start_date = datetime.utcnow() - timedelta(days=30)
        
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id,
            MoodEntry.created_at >= start_date
        ).all()
        
        habit_entries = db.query(HabitEntry).filter(
            HabitEntry.user_id == current_user.id,
            HabitEntry.created_at >= start_date
        ).all()
        
        # Convert to list of dicts for analysis
        mood_data = []
        for entry in mood_entries:
            mood_data.append({
                "mood_score": entry.mood_score,
                "mood_label": entry.mood_label,
                "energy_level": entry.energy_level,
                "stress_level": entry.stress_level,
                "created_at": entry.created_at.isoformat()
            })
        
        habit_data = []
        for entry in habit_entries:
            habit_data.append({
                "habit_name": entry.habit_name,
                "habit_value": entry.habit_value,
                "habit_unit": entry.habit_unit,
                "created_at": entry.created_at.isoformat()
            })
        
        # Generate correlations
        correlations = await insights_agent.analyze_habit_correlations(mood_data, habit_data)
        
        return {
            "correlations": correlations,
            "total_mood_entries": len(mood_entries),
            "total_habit_entries": len(habit_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting habit correlations: {str(e)}")

# Pattern analysis
@router.get("/patterns")
async def get_pattern_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pattern analysis from journal and mood data."""
    try:
        # Get recent entries
        start_date = datetime.utcnow() - timedelta(days=30)
        
        journal_entries = db.query(JournalEntry).filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.created_at >= start_date
        ).all()
        
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id,
            MoodEntry.created_at >= start_date
        ).all()
        
        # Convert to list of dicts for analysis
        journal_data = []
        for entry in journal_entries:
            journal_data.append({
                "content": entry.content,
                "mood_score": entry.mood_score,
                "mood_label": entry.mood_label,
                "themes": entry.themes,
                "emotional_triggers": entry.emotional_triggers,
                "created_at": entry.created_at.isoformat()
            })
        
        mood_data = []
        for entry in mood_entries:
            mood_data.append({
                "mood_score": entry.mood_score,
                "mood_label": entry.mood_label,
                "energy_level": entry.energy_level,
                "stress_level": entry.stress_level,
                "created_at": entry.created_at.isoformat()
            })
        
        # Generate pattern analysis
        patterns = await insights_agent.detect_patterns(journal_data, mood_data)
        
        return {
            "patterns": patterns,
            "total_journal_entries": len(journal_entries),
            "total_mood_entries": len(mood_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting pattern analysis: {str(e)}")

# Weekly summary
@router.get("/weekly-summary")
async def get_weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive weekly summary."""
    try:
        # Get entries from the last 7 days
        start_date = datetime.utcnow() - timedelta(days=7)
        
        journal_entries = db.query(JournalEntry).filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.created_at >= start_date
        ).all()
        
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id,
            MoodEntry.created_at >= start_date
        ).all()
        
        habit_entries = db.query(HabitEntry).filter(
            HabitEntry.user_id == current_user.id,
            HabitEntry.created_at >= start_date
        ).all()
        
        # Convert to list of dicts for analysis
        journal_data = []
        for entry in journal_entries:
            journal_data.append({
                "content": entry.content,
                "mood_score": entry.mood_score,
                "mood_label": entry.mood_label,
                "themes": entry.themes,
                "emotional_triggers": entry.emotional_triggers,
                "created_at": entry.created_at.isoformat()
            })
        
        mood_data = []
        for entry in mood_entries:
            mood_data.append({
                "mood_score": entry.mood_score,
                "mood_label": entry.mood_label,
                "energy_level": entry.energy_level,
                "stress_level": entry.stress_level,
                "created_at": entry.created_at.isoformat()
            })
        
        habit_data = []
        for entry in habit_entries:
            habit_data.append({
                "habit_name": entry.habit_name,
                "habit_value": entry.habit_value,
                "habit_unit": entry.habit_unit,
                "created_at": entry.created_at.isoformat()
            })
        
        # Generate insights
        mood_insights = await insights_agent.generate_mood_insights(mood_data, "week")
        habit_correlations = await insights_agent.analyze_habit_correlations(mood_data, habit_data)
        pattern_analysis = await insights_agent.detect_patterns(journal_data, mood_data)
        
        # Generate weekly summary
        summary = await insights_agent.generate_weekly_summary(
            mood_insights, habit_correlations, pattern_analysis
        )
        
        return {
            "summary": summary,
            "total_journal_entries": len(journal_entries),
            "total_mood_entries": len(mood_entries),
            "total_habit_entries": len(habit_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating weekly summary: {str(e)}")

@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics and overview."""
    try:
        # Count entries
        journal_count = db.query(JournalEntry).filter(
            JournalEntry.user_id == current_user.id
        ).count()
        
        mood_count = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id
        ).count()
        
        habit_count = db.query(HabitEntry).filter(
            HabitEntry.user_id == current_user.id
        ).count()
        
        # Get recent activity
        recent_journal = db.query(JournalEntry).filter(
            JournalEntry.user_id == current_user.id
        ).order_by(JournalEntry.created_at.desc()).first()
        
        recent_mood = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id
        ).order_by(MoodEntry.created_at.desc()).first()
        
        # Calculate average mood
        avg_mood = db.query(func.avg(MoodEntry.mood_score)).filter(
            MoodEntry.user_id == current_user.id
        ).scalar() or 5.0
        
        return {
            "total_journal_entries": journal_count,
            "total_mood_entries": mood_count,
            "total_habit_entries": habit_count,
            "average_mood": round(avg_mood, 2),
            "last_journal_date": recent_journal.created_at.isoformat() if recent_journal else None,
            "last_mood_date": recent_mood.created_at.isoformat() if recent_mood else None,
            "streak_days": 0  # TODO: Implement streak calculation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user stats: {str(e)}") 