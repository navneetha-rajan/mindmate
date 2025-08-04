from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import HumanMessage, SystemMessage
import json
import re
from typing import Dict, List, Any
from app.services.config import settings

class JournalAgent:
    def __init__(self):
        # Check if API key is available
        if settings.OPENAI_API_KEY:
            self.llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                temperature=0.3,
                model_name=settings.DEFAULT_LLM_MODEL
            )
            self.use_llm = True
        else:
            self.llm = None
            self.use_llm = False
        
        # Initialize analysis chains only if LLM is available
        if self.use_llm:
            self.mood_analyzer = self._create_mood_analyzer()
            self.theme_extractor = self._create_theme_extractor()
            self.trigger_analyzer = self._create_trigger_analyzer()
            self.insights_generator = self._create_insights_generator()
    
    def _create_mood_analyzer(self):
        prompt = PromptTemplate(
            input_variables=["content"],
            template="""
            Analyze the emotional tone and mood of the following journal entry.
            Provide a mood score (0-10, where 0 is very negative and 10 is very positive)
            and a descriptive mood label.
            
            Journal entry: {content}
            
            Respond in JSON format:
            {{
                "mood_score": <float>,
                "mood_label": "<string>",
                "confidence": <float>
            }}
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)
    
    def _create_theme_extractor(self):
        prompt = PromptTemplate(
            input_variables=["content"],
            template="""
            Extract recurring themes and topics from this journal entry.
            Focus on psychological, emotional, and behavioral patterns.
            
            Journal entry: {content}
            
            Respond in JSON format:
            {{
                "themes": ["theme1", "theme2", "theme3"],
                "primary_theme": "<string>",
                "theme_confidence": <float>
            }}
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)
    
    def _create_trigger_analyzer(self):
        prompt = PromptTemplate(
            input_variables=["content"],
            template="""
            Identify emotional triggers and stressors mentioned in this journal entry.
            Look for events, situations, or thoughts that caused emotional responses.
            
            Journal entry: {content}
            
            Respond in JSON format:
            {{
                "emotional_triggers": ["trigger1", "trigger2"],
                "stress_level": <int 1-10>,
                "coping_mechanisms": ["mechanism1", "mechanism2"]
            }}
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)
    
    def _create_insights_generator(self):
        prompt = PromptTemplate(
            input_variables=["content", "mood_analysis", "theme_analysis", "trigger_analysis"],
            template="""
            Generate key insights and observations from this journal entry analysis.
            Focus on patterns, growth opportunities, and areas for reflection.
            
            Journal entry: {content}
            Mood analysis: {mood_analysis}
            Theme analysis: {theme_analysis}
            Trigger analysis: {trigger_analysis}
            
            Respond in JSON format:
            {{
                "key_insights": ["insight1", "insight2", "insight3"],
                "growth_areas": ["area1", "area2"],
                "positive_patterns": ["pattern1", "pattern2"],
                "suggested_focus": "<string>"
            }}
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)
    
    async def analyze_journal_entry(self, content: str) -> Dict[str, Any]:
        """
        Analyze a journal entry and extract comprehensive insights.
        """
        try:
            if self.use_llm:
                # Run all analysis chains
                mood_result = await self.mood_analyzer.arun(content=content)
                theme_result = await self.theme_extractor.arun(content=content)
                trigger_result = await self.trigger_analyzer.arun(content=content)
                
                # Parse JSON responses
                mood_analysis = json.loads(mood_result)
                theme_analysis = json.loads(theme_result)
                trigger_analysis = json.loads(trigger_result)
                
                # Generate insights
                insights_result = await self.insights_generator.arun(
                    content=content,
                    mood_analysis=json.dumps(mood_analysis),
                    theme_analysis=json.dumps(theme_analysis),
                    trigger_analysis=json.dumps(trigger_analysis)
                )
                insights_analysis = json.loads(insights_result)
                
                return {
                    "mood_score": mood_analysis.get("mood_score", 5.0),
                    "mood_label": mood_analysis.get("mood_label", "neutral"),
                    "themes": theme_analysis.get("themes", []),
                    "emotional_triggers": trigger_analysis.get("emotional_triggers", []),
                    "stress_level": trigger_analysis.get("stress_level", 5),
                    "key_insights": insights_analysis.get("key_insights", []),
                    "growth_areas": insights_analysis.get("growth_areas", []),
                    "positive_patterns": insights_analysis.get("positive_patterns", []),
                    "suggested_focus": insights_analysis.get("suggested_focus", "")
                }
            else:
                # Use fallback analysis
                return self._fallback_analysis(content)
            
        except Exception as e:
            # Fallback analysis if LLM fails
            return self._fallback_analysis(content)
    
    def _fallback_analysis(self, content: str) -> Dict[str, Any]:
        """
        Simple fallback analysis using keyword matching.
        """
        content_lower = content.lower()
        
        # Simple mood analysis
        positive_words = ["happy", "joy", "excited", "grateful", "peaceful", "content"]
        negative_words = ["sad", "angry", "frustrated", "anxious", "depressed", "worried"]
        
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            mood_score = 7.0
            mood_label = "positive"
        elif negative_count > positive_count:
            mood_score = 3.0
            mood_label = "negative"
        else:
            mood_score = 5.0
            mood_label = "neutral"
        
        # Simple theme extraction
        themes = []
        if any(word in content_lower for word in ["work", "job", "career", "office"]):
            themes.append("work")
        if any(word in content_lower for word in ["relationship", "friend", "family", "partner"]):
            themes.append("relationships")
        if any(word in content_lower for word in ["health", "exercise", "diet", "sleep"]):
            themes.append("health")
        if any(word in content_lower for word in ["stress", "anxiety", "worry", "fear"]):
            themes.append("stress")
        
        return {
            "mood_score": mood_score,
            "mood_label": mood_label,
            "themes": themes,
            "emotional_triggers": [],
            "stress_level": 5,
            "key_insights": ["Analysis completed with fallback method"],
            "growth_areas": [],
            "positive_patterns": [],
            "suggested_focus": "Continue journaling to build patterns"
        }
    
    async def generate_weekly_summary(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate a weekly summary from multiple journal entries.
        """
        if not entries:
            return {"message": "No entries to summarize"}
        
        # Aggregate data
        mood_scores = [entry.get("mood_score", 5.0) for entry in entries]
        all_themes = []
        all_triggers = []
        
        for entry in entries:
            all_themes.extend(entry.get("themes", []))
            all_triggers.extend(entry.get("emotional_triggers", []))
        
        # Calculate trends
        avg_mood = sum(mood_scores) / len(mood_scores)
        mood_trend = "improving" if mood_scores[-1] > mood_scores[0] else "declining" if mood_scores[-1] < mood_scores[0] else "stable"
        
        # Find most common themes and triggers
        theme_counts = {}
        for theme in all_themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        trigger_counts = {}
        for trigger in all_triggers:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
        
        return {
            "average_mood": avg_mood,
            "mood_trend": mood_trend,
            "total_entries": len(entries),
            "most_common_themes": sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "most_common_triggers": sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "mood_range": {"min": min(mood_scores), "max": max(mood_scores)},
            "insights": [
                f"Average mood this week: {avg_mood:.1f}/10",
                f"Mood trend: {mood_trend}",
                f"Most discussed theme: {max(theme_counts.items(), key=lambda x: x[1])[0] if theme_counts else 'None'}"
            ]
        } 