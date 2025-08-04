from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from typing import Dict, List, Any, Optional
import json
import uuid
from datetime import datetime
from app.services.config import settings

class ConversationAgent:
    def __init__(self):
        # Check if API key is available
        if settings.OPENAI_API_KEY:
            self.llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                temperature=0.7,
                model_name=settings.DEFAULT_LLM_MODEL
            )
            self.use_llm = True
        else:
            self.llm = None
            self.use_llm = False
        
        # Initialize conversation types only if LLM is available
        if self.use_llm:
            self.socratic_prompt = self._create_socratic_prompt()
            self.cbt_prompt = self._create_cbt_prompt()
            self.general_prompt = self._create_general_prompt()
        
        # Conversation memory
        self.conversation_memories = {}
    
    def _create_socratic_prompt(self):
        return PromptTemplate(
            input_variables=["user_message", "conversation_history", "theme", "session_id"],
            template="""
            You are a Socratic dialogue coach helping the user explore their thoughts and feelings.
            Your role is to ask thoughtful, open-ended questions that help the user reflect deeper.
            Do NOT give advice or solutions. Instead, guide them to discover insights themselves.
            
            Current theme: {theme}
            Session ID: {session_id}
            
            Previous conversation:
            {conversation_history}
            
            User: {user_message}
            
            Respond with a thoughtful question or gentle reflection that encourages deeper thinking.
            Keep your response under 150 words and focus on one aspect at a time.
            """
        )
    
    def _create_cbt_prompt(self):
        return PromptTemplate(
            input_variables=["user_message", "conversation_history", "theme", "session_id"],
            template="""
            You are a CBT (Cognitive Behavioral Therapy) style coach helping the user identify
            thought patterns and cognitive distortions. Help them explore the connection between
            thoughts, emotions, and behaviors.
            
            Current theme: {theme}
            Session ID: {session_id}
            
            Previous conversation:
            {conversation_history}
            
            User: {user_message}
            
            Help them identify any cognitive distortions (like all-or-nothing thinking, catastrophizing,
            etc.) and gently guide them toward more balanced thinking. Ask questions that help them
            examine evidence for and against their thoughts.
            """
        )
    
    def _create_general_prompt(self):
        return PromptTemplate(
            input_variables=["user_message", "conversation_history", "theme", "session_id"],
            template="""
            You are a supportive mental wellness companion. Engage in a warm, empathetic conversation
            that helps the user feel heard and understood. Ask follow-up questions that show you're
            listening and care about their experience.
            
            Current theme: {theme}
            Session ID: {session_id}
            
            Previous conversation:
            {conversation_history}
            
            User: {user_message}
            
            Respond with empathy and curiosity. Ask questions that help them explore their feelings
            and experiences more deeply.
            """
        )
    
    def _get_conversation_memory(self, session_id: str) -> ConversationBufferMemory:
        """Get or create conversation memory for a session."""
        if session_id not in self.conversation_memories:
            self.conversation_memories[session_id] = ConversationBufferMemory(
                memory_key="conversation_history",
                return_messages=True
            )
        return self.conversation_memories[session_id]
    
    async def generate_response(
        self,
        user_message: str,
        session_id: str,
        conversation_type: str = "general",
        theme: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a response based on the conversation type and context.
        """
        try:
            if self.use_llm:
                print(f"Using LLM for conversation type: {conversation_type}")
                print(f"User message: {user_message}")
                
                # Get conversation memory
                memory = self._get_conversation_memory(session_id)
                
                # Choose appropriate prompt based on conversation type
                if conversation_type == "socratic":
                    prompt = self.socratic_prompt
                elif conversation_type == "cbt":
                    prompt = self.cbt_prompt
                else:
                    prompt = self.general_prompt
                
                print(f"Using prompt template: {conversation_type}")
                
                # Use the newer LangChain syntax
                chain = prompt | self.llm
                
                # Generate response
                response = await chain.ainvoke({
                    "user_message": user_message,
                    "theme": theme or "general",
                    "session_id": session_id,
                    "conversation_history": memory.buffer if hasattr(memory, 'buffer') else ""
                })
                
                print(f"LLM Response: {response}")
                
                # Update memory
                memory.save_context(
                    {"input": user_message},
                    {"output": response.content if hasattr(response, 'content') else str(response)}
                )
                
                return {
                    "response": response.content if hasattr(response, 'content') else str(response),
                    "conversation_type": conversation_type,
                    "theme": theme,
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                print("LLM not available, using fallback")
                # Fallback response without LLM
                return self._fallback_response(user_message, conversation_type, theme, session_id)
            
        except Exception as e:
            print(f"Error in generate_response: {str(e)}")
            import traceback
            traceback.print_exc()
            # Fallback response
            return self._fallback_response(user_message, conversation_type, theme, session_id)
    
    def _fallback_response(
        self,
        user_message: str,
        conversation_type: str,
        theme: Optional[str],
        session_id: str
    ) -> Dict[str, Any]:
        """Generate a fallback response when LLM is not available."""
        # Simple keyword-based responses
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ["sad", "depressed", "down", "unhappy"]):
            response = "I hear that you're feeling down. What's been on your mind lately?"
        elif any(word in user_lower for word in ["happy", "excited", "good", "great"]):
            response = "That's wonderful! What's contributing to your positive mood?"
        elif any(word in user_lower for word in ["stress", "anxious", "worried", "nervous"]):
            response = "Stress can be really challenging. Can you tell me more about what's causing you concern?"
        elif any(word in user_lower for word in ["work", "job", "career"]):
            response = "Work can be a significant part of our lives. How are things going for you professionally?"
        elif any(word in user_lower for word in ["relationship", "friend", "family"]):
            response = "Relationships are so important. What's happening in your relationships right now?"
        else:
            response = "I'm here to listen and support you. What would you like to talk about today?"
        
        return {
            "response": response,
            "conversation_type": conversation_type,
            "theme": theme,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "fallback": True
        }
    
    async def start_conversation(
        self,
        user_id: int,
        conversation_type: str = "general",
        theme: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Start a new conversation session.
        """
        session_id = str(uuid.uuid4())
        
        # Generate opening message based on type and theme
        opening_messages = {
            "socratic": "I'd like to explore this topic with you through some thoughtful questions. What's your initial thought about this?",
            "cbt": "Let's take a moment to examine your thoughts and feelings about this. What's going through your mind right now?",
            "general": "I'm here to listen and support you. What would you like to talk about today?"
        }
        
        opening = opening_messages.get(conversation_type, opening_messages["general"])
        
        if theme:
            opening = f"Let's focus on {theme}. {opening}"
        
        return {
            "session_id": session_id,
            "opening_message": opening,
            "conversation_type": conversation_type,
            "theme": theme,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def suggest_conversation_topics(self, user_history: List[Dict[str, Any]]) -> List[str]:
        """
        Suggest conversation topics based on user's journal history and patterns.
        """
        if not user_history:
            return [
                "How are you feeling today?",
                "What's been on your mind lately?",
                "Is there anything you'd like to explore or discuss?"
            ]
        
        # Analyze recent themes and patterns
        recent_themes = []
        for entry in user_history[-5:]:  # Last 5 entries
            themes = entry.get("themes", [])
            recent_themes.extend(themes)
        
        # Count theme frequency
        theme_counts = {}
        for theme in recent_themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        # Generate topic suggestions
        suggestions = []
        
        # Most frequent themes
        if theme_counts:
            top_theme = max(theme_counts.items(), key=lambda x: x[1])[0]
            suggestions.append(f"Let's explore your thoughts about {top_theme}")
        
        # Mood-based suggestions
        recent_moods = [entry.get("mood_label", "neutral") for entry in user_history[-3:]]
        if "negative" in recent_moods:
            suggestions.append("I notice you've been feeling down lately. Would you like to talk about what's been challenging?")
        
        # Growth areas
        for entry in user_history[-3:]:
            growth_areas = entry.get("growth_areas", [])
            if growth_areas:
                suggestions.append(f"I see you've been working on {growth_areas[0]}. How's that going?")
        
        # Default suggestions if none generated
        if not suggestions:
            suggestions = [
                "How has your week been so far?",
                "Is there anything you're looking forward to?",
                "What's been the highlight of your day?"
            ]
        
        return suggestions[:3]  # Return top 3 suggestions
    
    async def end_conversation(self, session_id: str) -> Dict[str, Any]:
        """
        End a conversation session and provide a summary.
        """
        memory = self.conversation_memories.get(session_id)
        
        if memory and self.use_llm:
            # Generate conversation summary
            summary_prompt = PromptTemplate(
                input_variables=["conversation_history"],
                template="""
                Summarize this conversation in 2-3 sentences, focusing on key insights
                and areas of growth discussed.
                
                Conversation:
                {conversation_history}
                
                Summary:
                """
            )
            
            summary_chain = LLMChain(llm=self.llm, prompt=summary_prompt)
            summary = await summary_chain.arun(conversation_history=str(memory.chat_memory.messages))
            
            # Clean up memory
            del self.conversation_memories[session_id]
            
            return {
                "session_id": session_id,
                "summary": summary,
                "message": "Thank you for sharing with me. I hope our conversation was helpful.",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Clean up memory
        if session_id in self.conversation_memories:
            del self.conversation_memories[session_id]
        
        return {
            "session_id": session_id,
            "message": "Thank you for our conversation. I hope it was helpful.",
            "timestamp": datetime.utcnow().isoformat()
        } 