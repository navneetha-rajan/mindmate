from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.models.database import get_db, JournalEntry, User
from app.models.schemas import JournalEntryCreate, JournalEntry as JournalEntrySchema, JournalAnalysis
from app.agents.journal_agent import JournalAgent
from app.api.auth import get_current_user

router = APIRouter()
journal_agent = JournalAgent()

@router.post("/", response_model=JournalEntrySchema)
async def create_journal_entry(
    entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new journal entry with AI analysis."""
    try:
        # Analyze the journal entry
        analysis = await journal_agent.analyze_journal_entry(entry.content)
        
        # Convert lists to JSON strings for database storage
        themes_json = json.dumps(analysis.get("themes", []))
        triggers_json = json.dumps(analysis.get("emotional_triggers", []))
        
        # Create database entry
        db_entry = JournalEntry(
            user_id=current_user.id,
            content=entry.content,
            mood_score=analysis.get("mood_score", 5.0),
            mood_label=analysis.get("mood_label", "neutral"),
            themes=themes_json,
            emotional_triggers=triggers_json
        )
        
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        
        return db_entry
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating journal entry: {str(e)}")

@router.get("/", response_model=List[JournalEntrySchema])
async def get_journal_entries(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's journal entries with pagination."""
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).order_by(JournalEntry.created_at.desc()).offset(skip).limit(limit).all()
    
    return entries

@router.get("/{entry_id}", response_model=JournalEntrySchema)
async def get_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    return entry

@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Journal entry deleted successfully"}

@router.get("/analysis/{entry_id}", response_model=JournalAnalysis)
async def get_journal_analysis(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI analysis for a specific journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    # Re-analyze the entry
    analysis = await journal_agent.analyze_journal_entry(entry.content)
    
    return JournalAnalysis(
        mood_score=analysis.get("mood_score", 5.0),
        mood_label=analysis.get("mood_label", "neutral"),
        themes=analysis.get("themes", []),
        emotional_triggers=analysis.get("emotional_triggers", []),
        sentiment_trend=analysis.get("sentiment_trend", "stable"),
        key_insights=analysis.get("key_insights", [])
    )

@router.get("/weekly-summary/")
async def get_weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly summary of journal entries."""
    # Get entries from the last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.created_at >= week_ago
    ).order_by(JournalEntry.created_at.desc()).all()
    
    # Convert to list of dicts for analysis
    entries_data = []
    for entry in entries:
        # Parse JSON strings back to lists
        themes = json.loads(entry.themes) if entry.themes else []
        triggers = json.loads(entry.emotional_triggers) if entry.emotional_triggers else []
        
        entries_data.append({
            "mood_score": entry.mood_score,
            "mood_label": entry.mood_label,
            "themes": themes,
            "emotional_triggers": triggers,
            "created_at": entry.created_at.isoformat()
        })
    
    # Generate weekly summary
    summary = await journal_agent.generate_weekly_summary(entries_data)
    
    return {
        "summary": summary,
        "total_entries": len(entries),
        "period": "last_7_days"
    }

@router.post("/analyze-text/")
async def analyze_text(
    content: str,
    current_user: User = Depends(get_current_user)
):
    """Analyze text without saving it as a journal entry."""
    try:
        analysis = await journal_agent.analyze_journal_entry(content)
        return {
            "analysis": analysis,
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

@router.get("/themes/")
async def get_recurring_themes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recurring themes from user's journal entries."""
    # Get all user's entries
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).order_by(JournalEntry.created_at.desc()).all()
    
    # Extract themes
    all_themes = []
    for entry in entries:
        if entry.themes:
            themes = json.loads(entry.themes) if isinstance(entry.themes, str) else entry.themes
            if isinstance(themes, list):
                all_themes.extend(themes)
    
    # Count theme frequency
    theme_counts = {}
    for theme in all_themes:
        theme_counts[theme] = theme_counts.get(theme, 0) + 1
    
    # Sort by frequency
    sorted_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "recurring_themes": sorted_themes[:10],  # Top 10 themes
        "total_entries": len(entries),
        "unique_themes": len(theme_counts)
    } 