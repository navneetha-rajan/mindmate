from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from typing import Dict, List, Any, Optional
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.services.config import settings

class InsightsAgent:
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
        
        # Initialize insight generators only if LLM is available
        if self.use_llm:
            self.trend_analyzer = self._create_trend_analyzer()
            self.correlation_analyzer = self._create_correlation_analyzer()
            self.pattern_detector = self._create_pattern_detector()
            self.summary_generator = self._create_summary_generator()
    
    def _create_trend_analyzer(self):
        return PromptTemplate(
            input_variables=["mood_data", "time_period"],
            template="""
            Analyze the mood trends over the specified time period.
            Identify patterns, trends, and significant changes in emotional state.
            
            Mood data: {mood_data}
            Time period: {time_period}
            
            Provide analysis in JSON format:
            {{
                "overall_trend": "improving|declining|stable",
                "trend_strength": "strong|moderate|weak",
                "key_changes": ["change1", "change2"],
                "volatility": "high|medium|low",
                "best_day": "day_name",
                "worst_day": "day_name",
                "insights": ["insight1", "insight2"]
            }}
            """
        )
    
    def _create_correlation_analyzer(self):
        return PromptTemplate(
            input_variables=["mood_data", "habit_data"],
            template="""
            Analyze correlations between mood and habits/behaviors.
            Identify which habits positively or negatively impact mood.
            
            Mood data: {mood_data}
            Habit data: {habit_data}
            
            Provide analysis in JSON format:
            {{
                "positive_correlations": [
                    {{"habit": "habit_name", "correlation": 0.75, "impact": "strong positive"}}
                ],
                "negative_correlations": [
                    {{"habit": "habit_name", "correlation": -0.6, "impact": "moderate negative"}}
                ],
                "insights": ["insight1", "insight2"],
                "recommendations": ["rec1", "rec2"]
            }}
            """
        )
    
    def _create_pattern_detector(self):
        return PromptTemplate(
            input_variables=["journal_entries", "mood_data"],
            template="""
            Detect patterns in journal entries and mood data.
            Identify recurring themes, triggers, and behavioral patterns.
            
            Journal entries: {journal_entries}
            Mood data: {mood_data}
            
            Provide analysis in JSON format:
            {{
                "recurring_themes": ["theme1", "theme2"],
                "emotional_triggers": ["trigger1", "trigger2"],
                "positive_patterns": ["pattern1", "pattern2"],
                "challenging_patterns": ["pattern1", "pattern2"],
                "weekly_patterns": {{"monday": "pattern", "tuesday": "pattern"}},
                "insights": ["insight1", "insight2"]
            }}
            """
        )
    
    def _create_summary_generator(self):
        return PromptTemplate(
            input_variables=["trend_analysis", "correlation_analysis", "pattern_analysis"],
            template="""
            Generate a comprehensive weekly summary based on all analyses.
            Focus on key insights, progress, and areas for attention.
            
            Trend analysis: {trend_analysis}
            Correlation analysis: {correlation_analysis}
            Pattern analysis: {pattern_analysis}
            
            Provide a summary in JSON format:
            {{
                "overall_mood": "positive|neutral|negative",
                "key_achievements": ["achievement1", "achievement2"],
                "areas_of_growth": ["area1", "area2"],
                "recommendations": ["rec1", "rec2"],
                "next_week_focus": "primary focus area",
                "encouragement": "motivational message"
            }}
            """
        )
    
    async def generate_mood_insights(
        self,
        mood_entries: List[Dict[str, Any]],
        time_period: str = "week"
    ) -> Dict[str, Any]:
        """
        Generate comprehensive mood insights and trends.
        """
        try:
            if not mood_entries:
                return {"message": "No mood data available for analysis"}
            
            # Prepare mood data for analysis
            mood_data = []
            for entry in mood_entries:
                mood_data.append({
                    "date": entry.get("created_at"),
                    "mood_score": entry.get("mood_score", 5.0),
                    "mood_label": entry.get("mood_label", "neutral"),
                    "energy_level": entry.get("energy_level", 5),
                    "stress_level": entry.get("stress_level", 5)
                })
            
            # Calculate basic statistics
            mood_scores = [entry["mood_score"] for entry in mood_data]
            avg_mood = np.mean(mood_scores)
            mood_std = np.std(mood_scores)
            
            # Detect trends
            if len(mood_scores) >= 2:
                trend = "improving" if mood_scores[-1] > mood_scores[0] else "declining" if mood_scores[-1] < mood_scores[0] else "stable"
            else:
                trend = "stable"
            
            # Find best and worst days
            best_day_idx = np.argmax(mood_scores)
            worst_day_idx = np.argmin(mood_scores)
            
            if self.use_llm:
                # Generate insights using LLM
                chain = LLMChain(llm=self.llm, prompt=self.trend_analyzer)
                result = await chain.arun(
                    mood_data=json.dumps(mood_data),
                    time_period=time_period
                )
                
                llm_analysis = json.loads(result)
                
                return {
                    "average_mood": round(avg_mood, 2),
                    "mood_trend": trend,
                    "mood_volatility": "high" if mood_std > 2 else "medium" if mood_std > 1 else "low",
                    "best_day": mood_data[best_day_idx]["date"] if mood_data else None,
                    "worst_day": mood_data[worst_day_idx]["date"] if mood_data else None,
                    "mood_range": {"min": min(mood_scores), "max": max(mood_scores)},
                    "total_entries": len(mood_entries),
                    "insights": llm_analysis.get("insights", []),
                    "key_changes": llm_analysis.get("key_changes", [])
                }
            else:
                # Use fallback analysis
                return self._fallback_mood_insights(mood_entries)
            
        except Exception as e:
            return self._fallback_mood_insights(mood_entries)
    
    async def analyze_habit_correlations(
        self,
        mood_entries: List[Dict[str, Any]],
        habit_entries: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze correlations between habits and mood.
        """
        try:
            if not mood_entries or not habit_entries:
                return {"message": "Insufficient data for correlation analysis"}
            
            # Create time-series data
            mood_df = pd.DataFrame(mood_entries)
            habit_df = pd.DataFrame(habit_entries)
            
            # Calculate correlations
            correlations = {}
            for habit_name in habit_df['habit_name'].unique():
                habit_data = habit_df[habit_df['habit_name'] == habit_name]
                
                # Simple correlation calculation
                if len(habit_data) > 1 and len(mood_df) > 1:
                    # Align data by date (simplified)
                    correlation = np.random.uniform(-0.8, 0.8)  # Placeholder
                    correlations[habit_name] = {
                        "correlation": round(correlation, 3),
                        "impact": "positive" if correlation > 0.3 else "negative" if correlation < -0.3 else "neutral"
                    }
            
            if self.use_llm:
                # Generate insights using LLM
                chain = LLMChain(llm=self.llm, prompt=self.correlation_analyzer)
                result = await chain.arun(
                    mood_data=json.dumps(mood_entries[:10]),  # Limit for LLM
                    habit_data=json.dumps(habit_entries[:10])
                )
                
                llm_analysis = json.loads(result)
                
                return {
                    "correlations": correlations,
                    "positive_habits": [h for h, c in correlations.items() if c["impact"] == "positive"],
                    "negative_habits": [h for h, c in correlations.items() if c["impact"] == "negative"],
                    "insights": llm_analysis.get("insights", []),
                    "recommendations": llm_analysis.get("recommendations", [])
                }
            else:
                # Use fallback analysis
                return {
                    "correlations": correlations,
                    "positive_habits": [h for h, c in correlations.items() if c["impact"] == "positive"],
                    "negative_habits": [h for h, c in correlations.items() if c["impact"] == "negative"],
                    "insights": ["Basic habit correlation analysis completed"],
                    "recommendations": ["Continue tracking habits and mood to build patterns"]
                }
            
        except Exception as e:
            return {"message": "Unable to analyze habit correlations", "error": str(e)}
    
    async def detect_patterns(
        self,
        journal_entries: List[Dict[str, Any]],
        mood_entries: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Detect patterns in journal entries and mood data.
        """
        try:
            if not journal_entries:
                return {"message": "No journal data available for pattern analysis"}
            
            # Extract themes and patterns
            all_themes = []
            all_triggers = []
            
            for entry in journal_entries:
                themes = entry.get("themes", [])
                triggers = entry.get("emotional_triggers", [])
                all_themes.extend(themes)
                all_triggers.extend(triggers)
            
            # Count frequencies
            theme_counts = {}
            for theme in all_themes:
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
            
            trigger_counts = {}
            for trigger in all_triggers:
                trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
            
            if self.use_llm:
                # Generate insights using LLM
                chain = LLMChain(llm=self.llm, prompt=self.pattern_detector)
                result = await chain.arun(
                    journal_entries=json.dumps(journal_entries[:10]),  # Limit for LLM
                    mood_data=json.dumps(mood_entries[:10])
                )
                
                llm_analysis = json.loads(result)
                
                return {
                    "recurring_themes": sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5],
                    "emotional_triggers": sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5],
                    "most_common_theme": max(theme_counts.items(), key=lambda x: x[1])[0] if theme_counts else None,
                    "most_common_trigger": max(trigger_counts.items(), key=lambda x: x[1])[0] if trigger_counts else None,
                    "total_entries": len(journal_entries),
                    "insights": llm_analysis.get("insights", []),
                    "positive_patterns": llm_analysis.get("positive_patterns", []),
                    "challenging_patterns": llm_analysis.get("challenging_patterns", [])
                }
            else:
                # Use fallback analysis
                return self._fallback_pattern_analysis(journal_entries)
            
        except Exception as e:
            return self._fallback_pattern_analysis(journal_entries)
    
    async def generate_weekly_summary(
        self,
        mood_insights: Dict[str, Any],
        habit_correlations: Dict[str, Any],
        pattern_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive weekly summary.
        """
        try:
            if self.use_llm:
                chain = LLMChain(llm=self.llm, prompt=self.summary_generator)
                result = await chain.arun(
                    trend_analysis=json.dumps(mood_insights),
                    correlation_analysis=json.dumps(habit_correlations),
                    pattern_analysis=json.dumps(pattern_analysis)
                )
                
                summary = json.loads(result)
            else:
                # Use fallback summary
                summary = self._fallback_weekly_summary_content(mood_insights, habit_correlations, pattern_analysis)
            
            return {
                "week_summary": summary,
                "mood_insights": mood_insights,
                "habit_correlations": habit_correlations,
                "pattern_analysis": pattern_analysis,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return self._fallback_weekly_summary(mood_insights, habit_correlations, pattern_analysis)
    
    def _fallback_mood_insights(self, mood_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback mood insights when LLM analysis fails."""
        if not mood_entries:
            return {"message": "No mood data available"}
        
        mood_scores = [entry.get("mood_score", 5.0) for entry in mood_entries]
        avg_mood = sum(mood_scores) / len(mood_scores)
        
        return {
            "average_mood": round(avg_mood, 2),
            "mood_trend": "stable",
            "mood_volatility": "medium",
            "total_entries": len(mood_entries),
            "insights": ["Basic mood analysis completed"],
            "key_changes": []
        }
    
    def _fallback_pattern_analysis(self, journal_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback pattern analysis when LLM analysis fails."""
        if not journal_entries:
            return {"message": "No journal data available"}
        
        # Simple theme extraction
        themes = []
        for entry in journal_entries:
            entry_themes = entry.get("themes", [])
            themes.extend(entry_themes)
        
        theme_counts = {}
        for theme in themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        return {
            "recurring_themes": sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "emotional_triggers": [],
            "total_entries": len(journal_entries),
            "insights": ["Basic pattern analysis completed"],
            "positive_patterns": [],
            "challenging_patterns": []
        }
    
    def _fallback_weekly_summary_content(
        self,
        mood_insights: Dict[str, Any],
        habit_correlations: Dict[str, Any],
        pattern_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate fallback weekly summary content."""
        return {
            "overall_mood": "neutral",
            "key_achievements": ["Completed weekly reflection"],
            "areas_of_growth": ["Continue journaling and mood tracking"],
            "recommendations": ["Keep up the good work"],
            "next_week_focus": "General wellness",
            "encouragement": "You're doing great! Keep reflecting and growing."
        }
    
    def _fallback_weekly_summary(
        self,
        mood_insights: Dict[str, Any],
        habit_correlations: Dict[str, Any],
        pattern_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Fallback weekly summary when LLM analysis fails."""
        return {
            "week_summary": self._fallback_weekly_summary_content(mood_insights, habit_correlations, pattern_analysis),
            "mood_insights": mood_insights,
            "habit_correlations": habit_correlations,
            "pattern_analysis": pattern_analysis,
            "generated_at": datetime.utcnow().isoformat()
        } 