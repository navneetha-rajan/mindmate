from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from typing import Dict, List, Any, Optional
import json
from datetime import datetime, timedelta
from app.services.config import settings

class PlannerAgent:
    def __init__(self):
        # Check if API key is available
        if settings.OPENAI_API_KEY:
            self.llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                temperature=0.5,
                model_name=settings.DEFAULT_LLM_MODEL
            )
            self.use_llm = True
        else:
            self.llm = None
            self.use_llm = False
        
        # Initialize planning prompts only if LLM is available
        if self.use_llm:
            self.weekly_planner = self._create_weekly_planner()
            self.theme_selector = self._create_theme_selector()
            self.goal_generator = self._create_goal_generator()
            self.pattern_analyzer = self._create_pattern_analyzer()
    
    def _create_weekly_planner(self):
        return PromptTemplate(
            input_variables=["user_history", "current_mood", "recent_themes"],
            template="""
            Based on the user's recent journal entries and patterns, create a personalized
            weekly conversation plan that addresses their current needs and growth areas.
            
            Recent journal themes: {recent_themes}
            Current mood trend: {current_mood}
            User history patterns: {user_history}
            
            Create a weekly plan with:
            1. 3-5 conversation themes to explore
            2. Specific goals for each theme
            3. Recommended conversation types (socratic, cbt, general)
            4. Priority order based on urgency/importance
            
            Respond in JSON format:
            {{
                "weekly_themes": [
                    {{
                        "theme": "theme_name",
                        "priority": 1-5,
                        "conversation_type": "socratic|cbt|general",
                        "goals": ["goal1", "goal2"],
                        "rationale": "why this theme is important"
                    }}
                ],
                "overall_focus": "main focus for the week",
                "expected_outcomes": ["outcome1", "outcome2"]
            }}
            """
        )
    
    def _create_theme_selector(self):
        return PromptTemplate(
            input_variables=["user_patterns", "current_context"],
            template="""
            Select the most appropriate conversation themes based on the user's patterns
            and current context. Focus on areas that would be most beneficial for their
            mental wellness and personal growth.
            
            User patterns: {user_patterns}
            Current context: {current_context}
            
            Available theme categories:
            - Emotional awareness (anxiety, stress, mood management)
            - Relationships (family, friends, romantic, work relationships)
            - Personal growth (confidence, self-esteem, goals)
            - Behavioral patterns (procrastination, habits, routines)
            - Cognitive patterns (thought patterns, beliefs, mindset)
            - Life transitions (changes, challenges, opportunities)
            
            Respond in JSON format:
            {{
                "selected_themes": ["theme1", "theme2", "theme3"],
                "reasoning": "why these themes were selected",
                "urgency_level": "high|medium|low"
            }}
            """
        )
    
    def _create_goal_generator(self):
        return PromptTemplate(
            input_variables=["theme", "user_context", "conversation_type"],
            template="""
            Generate specific, achievable goals for a conversation about this theme.
            Goals should be focused on exploration, understanding, and gentle growth.
            
            Theme: {theme}
            Conversation type: {conversation_type}
            User context: {user_context}
            
            Generate 2-3 specific goals that:
            - Help the user explore their thoughts and feelings
            - Identify patterns or insights
            - Support gentle self-reflection
            - Are appropriate for the conversation type
            
            Respond in JSON format:
            {{
                "goals": ["goal1", "goal2", "goal3"],
                "conversation_approach": "how to approach this theme",
                "success_indicators": ["indicator1", "indicator2"]
            }}
            """
        )
    
    def _create_pattern_analyzer(self):
        return PromptTemplate(
            input_variables=["journal_entries", "mood_data", "conversation_history"],
            template="""
            Analyze the user's patterns to identify recurring themes, emotional triggers,
            and areas that need attention or support.
            
            Journal entries: {journal_entries}
            Mood data: {mood_data}
            Conversation history: {conversation_history}
            
            Identify:
            1. Recurring themes or concerns
            2. Emotional patterns and triggers
            3. Areas of growth or challenge
            4. Positive patterns to reinforce
            5. Suggested focus areas for upcoming conversations
            
            Respond in JSON format:
            {{
                "recurring_themes": ["theme1", "theme2"],
                "emotional_patterns": ["pattern1", "pattern2"],
                "growth_areas": ["area1", "area2"],
                "positive_patterns": ["pattern1", "pattern2"],
                "suggested_focus": "primary focus area",
                "urgency_level": "high|medium|low"
            }}
            """
        )
    
    async def create_weekly_plan(
        self,
        user_id: int,
        journal_entries: List[Dict[str, Any]],
        mood_data: List[Dict[str, Any]],
        conversation_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create a personalized weekly conversation plan.
        """
        try:
            # Analyze patterns
            pattern_analysis = await self._analyze_patterns(
                journal_entries, mood_data, conversation_history
            )
            
            if self.use_llm:
                # Select themes using LLM
                theme_selection = await self._select_themes(pattern_analysis)
                
                # Generate weekly plan using LLM
                weekly_plan = await self._generate_weekly_plan(
                    pattern_analysis, theme_selection
                )
            else:
                # Use fallback theme selection and plan generation
                theme_selection = self._fallback_theme_selection(pattern_analysis)
                weekly_plan = self._fallback_weekly_plan(pattern_analysis, theme_selection)
            
            return {
                "user_id": user_id,
                "week_start": datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
                "themes": weekly_plan.get("weekly_themes", []),
                "overall_focus": weekly_plan.get("overall_focus", "Personal growth and reflection"),
                "expected_outcomes": weekly_plan.get("expected_outcomes", []),
                "pattern_insights": pattern_analysis,
                "status": "active",
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            # Fallback plan
            return self._create_fallback_plan(user_id)
    
    async def _analyze_patterns(
        self,
        journal_entries: List[Dict[str, Any]],
        mood_data: List[Dict[str, Any]],
        conversation_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze user patterns to identify themes and areas of focus."""
        try:
            # Prepare data for analysis
            recent_entries = journal_entries[-10:] if len(journal_entries) > 10 else journal_entries
            recent_moods = mood_data[-7:] if len(mood_data) > 7 else mood_data
            
            # Extract themes and patterns
            all_themes = []
            mood_trends = []
            
            for entry in recent_entries:
                themes = entry.get("themes", [])
                all_themes.extend(themes)
            
            for mood in recent_moods:
                mood_trends.append(mood.get("mood_score", 5.0))
            
            # Calculate patterns
            theme_counts = {}
            for theme in all_themes:
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
            
            avg_mood = sum(mood_trends) / len(mood_trends) if mood_trends else 5.0
            mood_trend = "stable"
            if len(mood_trends) >= 2:
                if mood_trends[-1] > mood_trends[0]:
                    mood_trend = "improving"
                elif mood_trends[-1] < mood_trends[0]:
                    mood_trend = "declining"
            
            return {
                "recurring_themes": sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5],
                "mood_trend": mood_trend,
                "average_mood": avg_mood,
                "total_entries": len(recent_entries),
                "conversation_count": len(conversation_history)
            }
            
        except Exception as e:
            return {
                "recurring_themes": [],
                "mood_trend": "stable",
                "average_mood": 5.0,
                "total_entries": 0,
                "conversation_count": 0
            }
    
    async def _select_themes(self, pattern_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Select appropriate themes based on user patterns."""
        try:
            # Use LLM to select themes
            chain = LLMChain(llm=self.llm, prompt=self.theme_selector)
            result = await chain.arun(
                user_patterns=json.dumps(pattern_analysis),
                current_context="weekly planning"
            )
            
            return json.loads(result)
            
        except Exception as e:
            # Fallback theme selection
            return self._fallback_theme_selection(pattern_analysis)
    
    def _fallback_theme_selection(self, pattern_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback theme selection when LLM is not available."""
        return {
            "selected_themes": ["personal growth", "emotional awareness", "relationships"],
            "reasoning": "General wellness themes",
            "urgency_level": "medium"
        }
    
    async def _generate_weekly_plan(
        self,
        pattern_analysis: Dict[str, Any],
        theme_selection: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate the weekly conversation plan."""
        try:
            chain = LLMChain(llm=self.llm, prompt=self.weekly_planner)
            result = await chain.arun(
                user_history=json.dumps(pattern_analysis),
                current_mood=pattern_analysis.get("mood_trend", "stable"),
                recent_themes=json.dumps(theme_selection.get("selected_themes", []))
            )
            
            return json.loads(result)
            
        except Exception as e:
            # Fallback weekly plan
            return self._fallback_weekly_plan(pattern_analysis, theme_selection)
    
    def _fallback_weekly_plan(
        self,
        pattern_analysis: Dict[str, Any],
        theme_selection: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Fallback weekly plan when LLM is not available."""
        return {
            "weekly_themes": [
                {
                    "theme": "personal growth",
                    "priority": 1,
                    "conversation_type": "general",
                    "goals": ["Explore current challenges", "Identify growth opportunities"],
                    "rationale": "General wellness focus"
                }
            ],
            "overall_focus": "Personal growth and reflection",
            "expected_outcomes": ["Increased self-awareness", "Better emotional understanding"]
        }
    
    def _create_fallback_plan(self, user_id: int) -> Dict[str, Any]:
        """Create a basic fallback plan when LLM analysis fails."""
        return {
            "user_id": user_id,
            "week_start": datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
            "themes": [
                {
                    "theme": "general wellness",
                    "priority": 1,
                    "conversation_type": "general",
                    "goals": ["Check in on overall wellbeing", "Explore current thoughts and feelings"],
                    "rationale": "Basic wellness check"
                }
            ],
            "overall_focus": "General wellness and reflection",
            "expected_outcomes": ["Better self-awareness", "Emotional support"],
            "pattern_insights": {
                "recurring_themes": [],
                "mood_trend": "stable",
                "average_mood": 5.0,
                "total_entries": 0,
                "conversation_count": 0
            },
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
    
    async def adjust_plan_based_on_progress(
        self,
        current_plan: Dict[str, Any],
        recent_activity: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Adjust the weekly plan based on recent user activity and progress.
        """
        # Analyze recent activity
        completed_themes = []
        new_insights = []
        
        for activity in recent_activity:
            if activity.get("type") == "conversation":
                theme = activity.get("theme")
                if theme:
                    completed_themes.append(theme)
            
            if activity.get("type") == "journal":
                insights = activity.get("key_insights", [])
                new_insights.extend(insights)
        
        # Adjust plan based on progress
        adjusted_themes = []
        for theme in current_plan.get("themes", []):
            if theme["theme"] not in completed_themes:
                adjusted_themes.append(theme)
        
        # Add new themes based on recent insights
        if new_insights:
            # Add a theme based on recent insights
            adjusted_themes.append({
                "theme": "recent insights",
                "priority": 2,
                "conversation_type": "socratic",
                "goals": ["Explore recent insights", "Deepen understanding"],
                "rationale": "Based on recent journal insights"
            })
        
        return {
            **current_plan,
            "themes": adjusted_themes,
            "adjusted_at": datetime.utcnow().isoformat()
        } 