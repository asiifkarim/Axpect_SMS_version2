"""
AI Field Report Processor - Enhanced version integrated with production system
Combines field report processing with existing AI chatbot infrastructure
"""

import json
import re
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from main_app.models import (
    JobCard, JobCardAction, Customer, Order, OrderItem, 
    Payment, Item, CustomUser
)
import logging

# Use existing AI infrastructure
try:
    from ai.llm_handler import LLMHandler
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

logger = logging.getLogger('ai')

class AIFieldProcessor:
    """
    Enhanced AI field report processor integrated with production AI system
    """
    
    def __init__(self):
        self.llm_handler = LLMHandler() if AI_AVAILABLE else None
        
    def process_field_report(self, jobcard_action_id):
        """
        Process field report text and extract structured data
        Integrated with existing AI infrastructure
        """
        try:
            action = JobCardAction.objects.get(id=jobcard_action_id)
            
            # Create processing log using existing AI logging
            log_data = {
                'action_type': 'field_report_processing',
                'input_text': action.note_text,
                'jobcard_id': action.jobcard.id,
                'user_id': action.actor.id if action.actor else None
            }
            
            logger.info(f"Processing field report for JobCard {action.jobcard.id}")
            
            # Process with integrated AI system
            if self.llm_handler:
                processed_data = self._extract_entities_with_llm(action.note_text)
            else:
                processed_data = self._fallback_extraction(action.note_text)
            
            # Update action with structured data
            if not hasattr(action, 'structured_json'):
                # Add structured_json field if it doesn't exist
                action.structured_json = {}
            
            action.structured_json = processed_data
            action.save()
            
            # Create follow-up tasks if needed
            self._create_followup_tasks(action, processed_data)
            
            # Update job card status based on extracted data
            self._update_jobcard_status(action, processed_data)
            
            logger.info(f"Successfully processed field report for JobCard {action.jobcard.id}")
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to process field report: {str(e)}")
            raise e
    
    def _extract_entities_with_llm(self, text):
        """
        Use integrated LLM system to extract entities from field report text
        """
        prompt = f"""
        Extract structured information from this field visit report:
        "{text}"
        
        Please extract and return a JSON object with the following fields:
        - customer_name: Name of the customer/company visited
        - contact_person: Name of the person met
        - visit_outcome: Summary outcome (order_taken, payment_collected, complaint_resolved, visit_completed, follow_up_needed)
        - order_details: If order was taken (item, quantity, rate, amount)
        - payment_details: If payment was collected (method, amount, reference_numbers)
        - follow_up_required: If follow-up is needed (yes/no)
        - follow_up_date: When to follow up (if mentioned)
        - follow_up_reason: Why follow-up is needed
        - priority: Priority level (high, medium, low)
        - confidence: Confidence score (0-1) for the extraction
        - extracted_entities: List of key entities found
        
        Return only valid JSON format.
        """
        
        try:
            # Use existing LLM handler
            response = self.llm_handler.get_completion(
                prompt=prompt,
                system_message="You are an AI assistant that extracts structured data from sales field reports. Always return valid JSON.",
                max_tokens=800,
                temperature=0.1
            )
            
            # Try to parse JSON
            try:
                result = json.loads(response)
                result['processing_method'] = 'llm'
                result['processed_at'] = timezone.now().isoformat()
                return result
            except json.JSONDecodeError:
                logger.warning("LLM response was not valid JSON, falling back to regex extraction")
                return self._fallback_extraction(text)
                
        except Exception as e:
            logger.error(f"LLM processing error: {e}")
            return self._fallback_extraction(text)
    
    def _fallback_extraction(self, text):
        """
        Enhanced fallback extraction using regex patterns
        """
        extracted = {
            'customer_name': '',
            'contact_person': '',
            'visit_outcome': 'visit_completed',
            'order_details': {},
            'payment_details': {},
            'follow_up_required': 'no',
            'follow_up_date': '',
            'follow_up_reason': '',
            'priority': 'medium',
            'confidence': 0.6,
            'extracted_entities': [],
            'processing_method': 'regex',
            'processed_at': timezone.now().isoformat()
        }
        
        # Extract customer names (enhanced patterns)
        customer_patterns = [
            r'(?:met|visited|at|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Ltd|Pvt|Company|Corp|Inc))?)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:company|ltd|pvt|corp|inc)',
            r'(?:customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in customer_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['customer_name'] = match.group(1).strip()
                extracted['extracted_entities'].append(f"customer: {match.group(1)}")
                break
        
        # Extract contact person names
        contact_patterns = [
            r'(?:met|spoke with|contacted)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
            r'(?:Mr|Mrs|Ms)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
        ]
        
        for pattern in contact_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['contact_person'] = match.group(1).strip()
                extracted['extracted_entities'].append(f"contact: {match.group(1)}")
                break
        
        # Extract order details
        qty_pattern = r'(\d+)\s*(?:bales?|kg|tons?|pieces?|units?)'
        qty_match = re.search(qty_pattern, text, re.IGNORECASE)
        if qty_match:
            extracted['order_details']['quantity'] = int(qty_match.group(1))
            extracted['extracted_entities'].append(f"quantity: {qty_match.group(1)}")
        
        # Extract rates/prices (enhanced)
        rate_patterns = [
            r'(?:rate|price|₹|rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per|/)\s*(?:kg|ton|piece|unit)',
        ]
        
        for pattern in rate_patterns:
            rate_match = re.search(pattern, text, re.IGNORECASE)
            if rate_match:
                rate_value = float(rate_match.group(1).replace(',', ''))
                extracted['order_details']['rate'] = rate_value
                extracted['extracted_entities'].append(f"rate: {rate_value}")
                break
        
        # Extract payment amounts (enhanced)
        payment_patterns = [
            r'(?:collected|received|paid|payment)\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:collected|received|paid)',
        ]
        
        for pattern in payment_patterns:
            payment_match = re.search(pattern, text, re.IGNORECASE)
            if payment_match:
                payment_value = float(payment_match.group(1).replace(',', ''))
                extracted['payment_details']['amount'] = payment_value
                extracted['extracted_entities'].append(f"payment: {payment_value}")
                break
        
        # Extract payment methods
        payment_method_patterns = [
            r'(cheque|check|cash|online|transfer|upi|card)',
            r'(rtgs|neft|imps)',
        ]
        
        for pattern in payment_method_patterns:
            method_match = re.search(pattern, text, re.IGNORECASE)
            if method_match:
                extracted['payment_details']['method'] = method_match.group(1).lower()
                extracted['extracted_entities'].append(f"payment_method: {method_match.group(1)}")
                break
        
        # Determine visit outcome based on extracted data
        if extracted['order_details']:
            extracted['visit_outcome'] = 'order_taken'
        elif extracted['payment_details']:
            extracted['visit_outcome'] = 'payment_collected'
        
        # Check for follow-up indicators (enhanced)
        followup_keywords = [
            'follow', 'call back', 'visit again', 'after', 'next week', 
            'tomorrow', 'pending', 'will confirm', 'need to check'
        ]
        
        urgent_keywords = ['urgent', 'asap', 'immediately', 'today']
        
        if any(keyword in text.lower() for keyword in followup_keywords):
            extracted['follow_up_required'] = 'yes'
            extracted['follow_up_reason'] = 'mentioned in report'
            
            # Determine priority based on urgency
            if any(keyword in text.lower() for keyword in urgent_keywords):
                extracted['priority'] = 'high'
        
        # Extract follow-up timeframes
        timeframe_patterns = [
            r'(?:after|in)\s+(\d+)\s+days?',
            r'next\s+(week|month)',
            r'(tomorrow|today)',
        ]
        
        for pattern in timeframe_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['follow_up_date'] = match.group(0)
                break
        
        return extracted
    
    def _create_followup_tasks(self, action, processed_data):
        """
        Create follow-up job cards based on extracted data
        Enhanced with better date parsing and priority handling
        """
        if processed_data.get('follow_up_required') == 'yes':
            # Calculate follow-up date
            follow_up_date = self._parse_followup_date(processed_data.get('follow_up_date', ''))
            
            # Determine priority
            priority = processed_data.get('priority', 'medium').upper()
            if priority not in ['HIGH', 'MEDIUM', 'LOW']:
                priority = 'MEDIUM'
            
            # Create follow-up job card
            followup_jobcard = JobCard.objects.create(
                type='FOLLOWUP',
                priority=priority,
                status='PENDING',
                assigned_to=action.jobcard.assigned_to,
                customer=action.jobcard.customer,
                city=action.jobcard.city,
                due_at=follow_up_date,
                created_by=action.actor,
                created_reason=f"Auto-generated from AI field report analysis: {processed_data.get('follow_up_reason', 'Follow-up required')}",
                related_item=action.jobcard.related_item
            )
            
            logger.info(f"Created follow-up JobCard {followup_jobcard.id} for {follow_up_date}")
            
            return followup_jobcard
        
        return None
    
    def _update_jobcard_status(self, action, processed_data):
        """
        Update job card status based on extracted data
        """
        visit_outcome = processed_data.get('visit_outcome', 'visit_completed')
        
        # Update job card status based on outcome
        if visit_outcome in ['order_taken', 'payment_collected', 'visit_completed']:
            if processed_data.get('follow_up_required') != 'yes':
                action.jobcard.status = 'COMPLETED'
                action.jobcard.save()
                logger.info(f"Marked JobCard {action.jobcard.id} as completed")
        elif visit_outcome == 'follow_up_needed':
            action.jobcard.status = 'PENDING'
            action.jobcard.save()
    
    def _parse_followup_date(self, date_text):
        """
        Enhanced date parsing from natural language text
        """
        today = timezone.now()
        
        if not date_text:
            return today + timedelta(days=3)  # Default to 3 days
        
        date_text = date_text.lower()
        
        # Specific day references
        if 'today' in date_text:
            return today
        elif 'tomorrow' in date_text:
            return today + timedelta(days=1)
        elif 'next week' in date_text:
            return today + timedelta(days=7)
        elif 'next month' in date_text:
            return today + timedelta(days=30)
        
        # Extract number of days
        day_match = re.search(r'(?:after|in)\s+(\d+)\s+days?', date_text)
        if day_match:
            days = int(day_match.group(1))
            return today + timedelta(days=days)
        
        # Extract weeks
        week_match = re.search(r'(?:after|in)\s+(\d+)\s+weeks?', date_text)
        if week_match:
            weeks = int(week_match.group(1))
            return today + timedelta(weeks=weeks)
        
        # Default to 3 days if no specific timeframe found
        return today + timedelta(days=3)

    def analyze_job_performance(self, employee_id, days=30):
        """
        Analyze job performance based on field reports
        New feature combining AI analysis with performance metrics
        """
        try:
            employee = CustomUser.objects.get(id=employee_id)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            # Get job cards for the employee in the date range
            job_cards = JobCard.objects.filter(
                assigned_to=employee,
                created_at__gte=start_date,
                created_at__lte=end_date
            )
            
            performance_data = {
                'employee_id': employee_id,
                'employee_name': f"{employee.first_name} {employee.last_name}",
                'analysis_period': f"{start_date.date()} to {end_date.date()}",
                'total_jobs': job_cards.count(),
                'completed_jobs': job_cards.filter(status='COMPLETED').count(),
                'pending_jobs': job_cards.filter(status='PENDING').count(),
                'orders_taken': 0,
                'payments_collected': 0,
                'follow_ups_generated': 0,
                'performance_score': 0.0
            }
            
            # Analyze job card actions with AI processing
            for job_card in job_cards:
                actions = JobCardAction.objects.filter(jobcard=job_card)
                for action in actions:
                    if hasattr(action, 'structured_json') and action.structured_json:
                        data = action.structured_json
                        if data.get('visit_outcome') == 'order_taken':
                            performance_data['orders_taken'] += 1
                        elif data.get('visit_outcome') == 'payment_collected':
                            performance_data['payments_collected'] += 1
                        if data.get('follow_up_required') == 'yes':
                            performance_data['follow_ups_generated'] += 1
            
            # Calculate performance score
            if performance_data['total_jobs'] > 0:
                completion_rate = performance_data['completed_jobs'] / performance_data['total_jobs']
                order_rate = performance_data['orders_taken'] / performance_data['total_jobs']
                payment_rate = performance_data['payments_collected'] / performance_data['total_jobs']
                
                performance_data['performance_score'] = (
                    completion_rate * 0.4 + 
                    order_rate * 0.3 + 
                    payment_rate * 0.3
                ) * 100
            
            return performance_data
            
        except Exception as e:
            logger.error(f"Failed to analyze job performance: {str(e)}")
            raise e


# Integration with existing AI chatbot
def integrate_with_chatbot():
    """
    Integration function for existing AI chatbot
    Adds field report processing capabilities to chatbot actions
    """
    try:
        from ai.actions import ActionHandler
        
        # Add new action to existing chatbot
        def process_field_report_action(user, message_data):
            """
            New chatbot action for processing field reports
            """
            processor = AIFieldProcessor()
            
            # Extract job card ID from message
            import re
            job_match = re.search(r'job(?:card)?\s*(?:id\s*)?(\d+)', message_data.get('message', ''), re.IGNORECASE)
            
            if job_match:
                job_id = int(job_match.group(1))
                try:
                    # Find the latest action for this job card
                    action = JobCardAction.objects.filter(jobcard_id=job_id).order_by('-created_at').first()
                    if action:
                        result = processor.process_field_report(action.id)
                        return {
                            'success': True,
                            'message': f"✅ Field report processed successfully for Job Card {job_id}",
                            'data': result
                        }
                    else:
                        return {
                            'success': False,
                            'message': f"❌ No actions found for Job Card {job_id}"
                        }
                except Exception as e:
                    return {
                        'success': False,
                        'message': f"❌ Error processing field report: {str(e)}"
                    }
            else:
                return {
                    'success': False,
                    'message': "❌ Please specify a job card ID (e.g., 'process field report for job 123')"
                }
        
        # Register the new action
        if hasattr(ActionHandler, 'register_action'):
            ActionHandler.register_action('process_field_report', process_field_report_action)
        
        return True
        
    except ImportError:
        logger.warning("Could not integrate with AI chatbot - chatbot module not found")
        return False


# Test function
def test_field_processor():
    """
    Test function for AI field processor
    """
    processor = AIFieldProcessor()
    
    test_text = """
    Met Sahil at Tallam Brothers today, discussed new order requirements. 
    Collected order for 5 bales of 40s cut at rate ₹215 per bale. 
    Total amount ₹1075. Received 2 cheques as advance payment.
    He mentioned will transfer remaining funds online after 3 days.
    Need to follow up next week for delivery confirmation.
    """
    
    if processor.llm_handler:
        result = processor._extract_entities_with_llm(test_text)
    else:
        result = processor._fallback_extraction(test_text)
    
    print("Extracted data:", json.dumps(result, indent=2))
    return result


# Initialize integration on import
if AI_AVAILABLE:
    integrate_with_chatbot()
