"""
LLM Handler for AI Chatbot
Handles communication with OpenAI and Google Gemini APIs
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class LLMHandler:
    """Handles LLM API calls for the AI chatbot"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', '')
        self.gemini_api_key = getattr(settings, 'GEMINI_API_KEY', '')
        self.ai_model = getattr(settings, 'AI_MODEL', 'gemini')
    
    def generate_response(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate AI response based on user message and context
        
        Args:
            message: User's input message
            context: Additional context (user info, conversation history, etc.)
            
        Returns:
            Dict containing response text and metadata
        """
        try:
            if self.ai_model.lower() == 'openai':
                return self._call_openai(message, context)
            elif self.ai_model.lower() == 'gemini':
                return self._call_gemini(message, context)
            else:
                return self._fallback_response(message)
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                'response': "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                'success': False,
                'error': str(e)
            }
    
    def _call_openai(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call OpenAI API"""
        try:
            import openai
            
            if not self.openai_api_key:
                return self._fallback_response(message)
            
            openai.api_key = self.openai_api_key
            
            # Build system prompt
            system_prompt = self._build_system_prompt(context)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                'response': response.choices[0].message.content,
                'success': True,
                'model': 'openai',
                'tokens_used': response.usage.total_tokens
            }
            
        except ImportError:
            logger.error("OpenAI library not installed")
            return self._fallback_response(message)
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._fallback_response(message)
    
    def _call_gemini(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call Google Gemini API"""
        try:
            import google.generativeai as genai
            
            if not self.gemini_api_key:
                return self._fallback_response(message)
            
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # Build prompt
            prompt = self._build_system_prompt(context) + "\n\nUser: " + message
            
            response = model.generate_content(prompt)
            
            return {
                'response': response.text,
                'success': True,
                'model': 'gemini',
                'candidates': len(response.candidates) if hasattr(response, 'candidates') else 1
            }
            
        except ImportError:
            logger.error("Google Generative AI library not installed")
            return self._fallback_response(message)
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return self._fallback_response(message)
    
    def _build_system_prompt(self, context: Dict[str, Any] = None) -> str:
        """Build system prompt for the AI"""
        base_prompt = """You are an AI assistant for Axpect SMS, a staff management system. You help users with:

1. Task Management: Create, assign, and track tasks
2. Attendance: Check attendance records and reports
3. Employee Information: Look up employee details
4. Job Cards: Manage job cards and assignments
5. Field Reports: Process and analyze field reports
6. General Questions: Answer questions about the system

Be helpful, professional, and concise. If you need to perform specific actions, mention what you can do."""
        
        if context:
            user_info = context.get('user_info', {})
            if user_info:
                base_prompt += f"\n\nCurrent user: {user_info.get('name', 'Unknown')} ({user_info.get('type', 'Unknown')})"
        
        return base_prompt
    
    def _fallback_response(self, message: str) -> Dict[str, Any]:
        """Fallback response when AI services are unavailable"""
        return {
            'response': "I'm currently unable to process your request. Please check your AI configuration or try again later.",
            'success': False,
            'model': 'fallback'
        }
    
    def process_field_report(self, report_text: str) -> Dict[str, Any]:
        """
        Process field report text and extract structured data
        
        Args:
            report_text: Raw field report text
            
        Returns:
            Dict containing extracted structured data
        """
        try:
            # This is a simplified version - in production, you'd want more sophisticated NLP
            prompt = f"""
            Analyze this field report and extract key information in JSON format:
            
            Report: {report_text}
            
            Extract:
            - customer_name
            - contact_person
            - outcome (order_taken, follow_up, etc.)
            - order_details (quantity, rate, amount)
            - payment_details (method, amount, status)
            - follow_up_required (yes/no)
            - follow_up_reason
            - follow_up_date
            - confidence_score (0-1)
            
            Return only valid JSON.
            """
            
            if self.ai_model.lower() == 'openai':
                response = self._call_openai(prompt)
            elif self.ai_model.lower() == 'gemini':
                response = self._call_gemini(prompt)
            else:
                return self._fallback_field_report()
            
            if response.get('success'):
                try:
                    # Try to parse JSON from response
                    json_start = response['response'].find('{')
                    json_end = response['response'].rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = response['response'][json_start:json_end]
                        structured_data = json.loads(json_str)
                        return {
                            'success': True,
                            'structured_data': structured_data,
                            'confidence_score': structured_data.get('confidence_score', 0.8)
                        }
                except json.JSONDecodeError:
                    pass
            
            return self._fallback_field_report()
            
        except Exception as e:
            logger.error(f"Error processing field report: {str(e)}")
            return self._fallback_field_report()
    
    def _fallback_field_report(self) -> Dict[str, Any]:
        """Fallback for field report processing"""
        return {
            'success': False,
            'structured_data': {
                'customer_name': 'Unknown',
                'contact_person': 'Unknown',
                'outcome': 'Unknown',
                'order_details': {},
                'payment_details': {},
                'follow_up_required': False,
                'confidence_score': 0.0
            },
            'error': 'Unable to process field report'
        }