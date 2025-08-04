from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.database import get_db, Conversation as ConversationModel, User
from app.models.schemas import ConversationCreate, Conversation as ConversationSchema
from app.agents.conversation_agent import ConversationAgent
from app.api.auth import get_current_user

router = APIRouter()
conversation_agent = ConversationAgent()

# Pydantic models for requests
class StartConversationRequest(BaseModel):
    conversation_type: str = "general"
    theme: Optional[str] = None

class MessageRequest(BaseModel):
    message: str
    session_id: str
    conversation_type: str = "general"
    theme: Optional[str] = None

class EndConversationRequest(BaseModel):
    session_id: str

@router.post("/start")
async def start_conversation(
    request: StartConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new conversation session."""
    try:
        # Start conversation with agent
        session_data = await conversation_agent.start_conversation(
            user_id=current_user.id,
            conversation_type=request.conversation_type,
            theme=request.theme
        )
        
        return {
            "session_id": session_data["session_id"],
            "opening_message": session_data["opening_message"],
            "conversation_type": request.conversation_type,
            "theme": request.theme,
            "timestamp": session_data["timestamp"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting conversation: {str(e)}")

@router.post("/message")
async def send_message(
    request: MessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in an active conversation."""
    try:
        # Generate response from agent
        response_data = await conversation_agent.generate_response(
            user_message=request.message,
            session_id=request.session_id,
            conversation_type=request.conversation_type,
            theme=request.theme
        )
        
        # Save conversation to database
        db_conversation = ConversationModel(
            user_id=current_user.id,
            session_id=request.session_id,
            message=request.message,
            response=response_data["response"],
            conversation_type=request.conversation_type,
            theme=request.theme
        )
        
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        
        return {
            "response": response_data["response"],
            "session_id": request.session_id,
            "conversation_type": request.conversation_type,
            "theme": request.theme,
            "timestamp": response_data["timestamp"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.post("/end")
async def end_conversation(
    request: EndConversationRequest,
    current_user: User = Depends(get_current_user)
):
    """End a conversation session."""
    try:
        summary = await conversation_agent.end_conversation(request.session_id)
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending conversation: {str(e)}")

@router.get("/history")
async def get_conversation_history(
    session_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation history for the user."""
    query = db.query(ConversationModel).filter(
        ConversationModel.user_id == current_user.id
    )
    
    if session_id:
        query = query.filter(ConversationModel.session_id == session_id)
    
    conversations = query.order_by(ConversationModel.created_at.desc()).offset(skip).limit(limit).all()
    
    return conversations

@router.get("/suggestions")
async def get_conversation_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation topic suggestions based on user history."""
    try:
        # Get recent journal entries for context
        recent_entries = db.query(ConversationModel).filter(
            ConversationModel.user_id == current_user.id
        ).order_by(ConversationModel.created_at.desc()).limit(10).all()
        
        # Convert to list of dicts
        history_data = []
        for entry in recent_entries:
            history_data.append({
                "type": "conversation",
                "theme": entry.theme,
                "conversation_type": entry.conversation_type,
                "created_at": entry.created_at.isoformat()
            })
        
        # Get suggestions from agent
        suggestions = await conversation_agent.suggest_conversation_topics(history_data)
        
        return {
            "suggestions": suggestions,
            "total_conversations": len(recent_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggestions: {str(e)}")

@router.get("/sessions")
async def get_active_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active conversation sessions for the user."""
    # Get unique session IDs from recent conversations
    sessions = db.query(ConversationModel.session_id).filter(
        ConversationModel.user_id == current_user.id
    ).distinct().all()
    
    session_list = []
    for session in sessions:
        session_id = session[0]
        # Get latest conversation for this session
        latest = db.query(ConversationModel).filter(
            ConversationModel.session_id == session_id
        ).order_by(ConversationModel.created_at.desc()).first()
        
        if latest:
            session_list.append({
                "session_id": session_id,
                "last_message": latest.message,
                "last_response": latest.response,
                "conversation_type": latest.conversation_type,
                "theme": latest.theme,
                "last_updated": latest.created_at.isoformat()
            })
    
    return {
        "active_sessions": session_list,
        "total_sessions": len(session_list)
    }

@router.get("/types")
async def get_conversation_types():
    """Get available conversation types."""
    return {
        "conversation_types": [
            {
                "type": "general",
                "description": "General supportive conversation",
                "best_for": "Daily check-ins and general support"
            },
            {
                "type": "socratic",
                "description": "Socratic dialogue with thoughtful questions",
                "best_for": "Deep reflection and self-discovery"
            },
            {
                "type": "cbt",
                "description": "Cognitive Behavioral Therapy style",
                "best_for": "Identifying thought patterns and cognitive distortions"
            }
        ]
    }

@router.get("/themes")
async def get_conversation_themes():
    """Get available conversation themes."""
    return {
        "themes": [
            "personal growth",
            "relationships",
            "work and career",
            "stress and anxiety",
            "self-esteem",
            "goals and motivation",
            "emotional awareness",
            "mindfulness",
            "life transitions",
            "creativity",
            "health and wellness",
            "social connections"
        ]
    } 