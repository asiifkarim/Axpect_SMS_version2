from rest_framework import serializers
from django.contrib.auth import authenticate
from main_app.models import (
    CustomUser, Employee, Customer, JobCard, JobCardAction, 
    Order, OrderItem, Payment, Attendance,
    CommunicationLog, City, Item, Notification,
    StaffScoresDaily, EmployeeTask, PriceList, BusinessCalendar,
    RateAlert, StaffCapability, CustomerCapability, ChatGroup, ChatMessage
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type', 'profile_pic']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')

        return data


class AttendanceSerializer(serializers.ModelSerializer):
    working_city_name = serializers.CharField(source='working_city.name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'department', 'date', 'notes', 'start_ts', 'end_ts', 
                 'start_gps', 'end_gps', 'working_city', 'working_city_name', 
                 'created_at', 'updated_at']


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'country']


class CustomerSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id', 'name', 'code', 'city', 'city_name', 'address', 
                 'phone_primary', 'email', 'active']


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'uom', 'category']


class JobCardSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.admin.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    related_item_name = serializers.CharField(source='related_item.name', read_only=True)
    
    # Virtual fields for backward compatibility
    title = serializers.SerializerMethodField()
    created_reason = serializers.SerializerMethodField()
    due_at = serializers.DateTimeField(source='due_date', read_only=True)
    created_at = serializers.DateTimeField(source='created_date', read_only=True)
    
    def get_title(self, obj):
        """Extract title from description or use job card number"""
        if obj.description:
            # Take first line as title, or first 50 chars
            lines = obj.description.strip().split('\n')
            title = lines[0].strip()
            return title[:50] + '...' if len(title) > 50 else title
        return f"Job Card #{obj.id}"
    
    def get_created_reason(self, obj):
        """Generate created reason from available data"""
        if obj.type:
            return f"Created for {obj.get_type_display()}"
        return "Job card created"
    
    class Meta:
        model = JobCard
        fields = ['id', 'description', 'type', 'priority', 'status', 
                 'assigned_to', 'assigned_to_name', 'assigned_by', 'assigned_by_name',
                 'customer', 'customer_name', 'city', 'city_name', 'related_item', 'related_item_name',
                 'due_date', 'due_at', 'created_date', 'created_at', 'updated_at',
                 'title', 'created_reason']


class JobCardActionSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    
    class Meta:
        model = JobCardAction
        fields = ['id', 'jobcard', 'actor', 'actor_name', 'action', 
                 'timestamp', 'note_text', 'structured_json']


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by_staff.admin.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_name', 'order_date', 
                 'created_by_staff', 'created_by_name', 'status', 
                 'total_bales', 'total_amount', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'item', 'item_name', 'cut', 'rate', 'qty_bales', 'amount']


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'customer', 'customer_name', 'order', 'payment_date', 
                 'method', 'amount', 'notes', 'created_at']




class CommunicationLogSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = CommunicationLog
        fields = ['id', 'channel', 'direction', 'customer', 'customer_name',
                 'user', 'user_name', 'subject', 'body', 'timestamp', 'linkages']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'jobcard', 'channel', 'title', 'message',
                 'sent_at', 'delivered_at', 'created_at']


class StaffScoresDailySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.admin.get_full_name', read_only=True)
    
    class Meta:
        model = StaffScoresDaily
        fields = ['id', 'employee', 'employee_name', 'date', 'score', 'max_score', 
                 'percentage', 'created_at', 'updated_at']


class EmployeeTaskSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.admin.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    
    class Meta:
        model = EmployeeTask
        fields = ['id', 'employee', 'employee_name', 'assigned_by', 'assigned_by_name',
                 'title', 'description', 'priority', 'status', 'due_date', 'completed_date',
                 'created_at', 'updated_at']


class PriceListSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    
    class Meta:
        model = PriceList
        fields = ['id', 'item', 'item_name', 'city', 'city_name', 'rate', 
                 'effective_from', 'effective_to', 'is_active', 'created_at', 'updated_at']


class BusinessCalendarSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    
    class Meta:
        model = BusinessCalendar
        fields = ['id', 'date', 'is_working_day', 'is_holiday', 'holiday_name', 
                 'notes', 'city', 'city_name', 'applies_to_all', 'created_at', 'updated_at']


class RateAlertSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    
    class Meta:
        model = RateAlert
        fields = ['id', 'item', 'item_name', 'city', 'city_name', 'threshold_percentage',
                 'direction', 'is_active', 'created_at', 'updated_at']


class StaffCapabilitySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.admin.get_full_name', read_only=True)
    capability_name = serializers.CharField(source='capability', read_only=True)
    
    class Meta:
        model = StaffCapability
        fields = ['id', 'employee', 'employee_name', 'capability', 'capability_name',
                 'level', 'notes', 'created_at', 'updated_at']


class CustomerCapabilitySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    capability_name = serializers.CharField(source='capability', read_only=True)
    
    class Meta:
        model = CustomerCapability
        fields = ['id', 'customer', 'customer_name', 'capability', 'capability_name',
                 'level', 'notes', 'created_at', 'updated_at']


class ChatGroupSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.filter(is_deleted=False).order_by('-created_at').first()
        if last_msg:
            return {
                'id': last_msg.id,
                'sender': last_msg.sender.get_full_name(),
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'created_at': last_msg.created_at
            }
        return None
    
    class Meta:
        model = ChatGroup
        fields = ['id', 'name', 'description', 'group_type', 'is_active', 
                 'member_count', 'last_message', 'created_at', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    
    def get_sender_avatar(self, obj):
        # Return a placeholder or actual avatar URL
        return f"/static/img/avatar.png"
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'group', 'sender', 'sender_name', 'sender_avatar', 'content',
                 'message_type', 'is_deleted', 'created_at', 'updated_at']
