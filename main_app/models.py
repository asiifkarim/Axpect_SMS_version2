from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import UserManager
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone




class CustomUserManager(UserManager):
    def _create_user(self, email, password, **extra_fields):
        email = self.normalize_email(email)
        user = CustomUser(email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        assert extra_fields["is_staff"]
        assert extra_fields["is_superuser"]
        return self._create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    USER_TYPE = ((1, "CEO"), (2, "Manager"), (3, "Employee"))
    GENDER = [("M", "Male"), ("F", "Female")]
    
    username = None  # Removed username, using email instead
    email = models.EmailField(unique=True)
    user_type = models.CharField(default=1, choices=USER_TYPE, max_length=1)
    gender = models.CharField(max_length=1, choices=GENDER)
    profile_pic = models.ImageField()
    address = models.TextField()
    fcm_token = models.TextField(default="")  # For firebase notifications
    is_online = models.BooleanField(default=False)  # Track if user is currently signed in
    last_seen = models.DateTimeField(null=True, blank=True)  # Last activity timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = CustomUserManager()
    def __str__(self):
        return self.last_name + ", " + self.first_name


class Admin(models.Model):
    admin = models.OneToOneField(CustomUser, on_delete=models.CASCADE)



class Division(models.Model):
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Manager(models.Model):
    division = models.ForeignKey(Division, on_delete=models.DO_NOTHING, null=True, blank=False)
    admin = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.admin.last_name + " " + self.admin.first_name


class Department(models.Model):
    name = models.CharField(max_length=120)
    division = models.ForeignKey(Division, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    admin = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    division = models.ForeignKey(Division, on_delete=models.DO_NOTHING, null=True, blank=False)
    department = models.ForeignKey(Department, on_delete=models.DO_NOTHING, null=True, blank=False)

    def __str__(self):
        return self.admin.last_name + ", " + self.admin.first_name


class Attendance(models.Model):
    department = models.ForeignKey(Department, on_delete=models.DO_NOTHING)
    date = models.DateField()
    notes = models.TextField(blank=True)
    
    # GPS tracking fields for check-in/check-out
    start_ts = models.DateTimeField(null=True, blank=True, help_text='Check-in timestamp')
    end_ts = models.DateTimeField(null=True, blank=True, help_text='Check-out timestamp')
    start_gps = models.CharField(max_length=100, blank=True, help_text='Check-in GPS coordinates (lat,lon)')
    end_gps = models.CharField(max_length=100, blank=True, help_text='Check-out GPS coordinates (lat,lon)')
    working_city = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True, help_text='City where employee is working')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AttendanceReport(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.DO_NOTHING)
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE)
    status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LeaveReportEmployee(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.CharField(max_length=60)
    message = models.TextField()
    status = models.SmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LeaveReportManager(models.Model):
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    date = models.CharField(max_length=60)
    message = models.TextField()
    status = models.SmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class FeedbackEmployee(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    feedback = models.TextField()
    reply = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class FeedbackManager(models.Model):
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    feedback = models.TextField()
    reply = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class NotificationManager(models.Model):
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class NotificationEmployee(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class EmployeeSalary(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    base = models.FloatField(default=0)
    ctc = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.user_type == 1:
            Admin.objects.create(admin=instance)
        if instance.user_type == 2:
            Manager.objects.create(admin=instance)
        if instance.user_type == 3:
            Employee.objects.create(admin=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if instance.user_type == 1:
        instance.admin.save()
    if instance.user_type == 2:
        instance.manager.save()
    if instance.user_type == 3:
        instance.employee.save()


# -----------------------------
# Core Sales CRM Models (PRD)
# -----------------------------


class City(models.Model):
    name = models.CharField(max_length=120)
    state = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    geofence_polygon = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Customer(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=60, unique=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    address = models.TextField(blank=True)
    phone_primary = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    active = models.BooleanField(default=True)
    owner_staff = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['active']),
            models.Index(fields=['owner_staff']),
            models.Index(fields=['city', 'active']),
        ]

    def __str__(self):
        return self.name


class CustomerContact(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="contacts")
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.customer.name}"


class Item(models.Model):
    CATEGORY_CHOICES = (
        ("YARN", "Yarn"),
        ("OTHER", "Other"),
    )

    name = models.CharField(max_length=255)
    uom = models.CharField(max_length=30, default="bales")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="YARN")

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = (
        ("DRAFT", "Draft"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
    )

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order_date = models.DateField()
    created_by_staff = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    total_bales = models.FloatField(default=0)
    total_amount = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    item = models.ForeignKey(Item, on_delete=models.PROTECT)
    cut = models.CharField(max_length=60, blank=True)
    rate = models.FloatField(default=0)
    qty_bales = models.FloatField(default=0)
    amount = models.FloatField(default=0)


# Old JobCard model removed - using new comprehensive JobCard model below

class JobCardAction(models.Model):
    """Legacy JobCardAction model - kept for backward compatibility"""
    ACTION_CHOICES = (
        ("UPDATE", "Update"),
        ("COMPLETE", "Complete"),
        ("REASSIGN", "Reassign"),
    )

    jobcard = models.ForeignKey('JobCard', on_delete=models.CASCADE, related_name="legacy_actions")
    actor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    note_text = models.TextField(blank=True)
    structured_json = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.action} on {self.jobcard} by {self.actor}"




class CommunicationLog(models.Model):
    CHANNEL_CHOICES = (
        ("PHONE", "Phone"),
        ("WHATSAPP", "WhatsApp"),
        ("EMAIL", "Email"),
        ("VISIT", "In-person"),
    )
    DIRECTION_CHOICES = (
        ("IN", "Inbound"),
        ("OUT", "Outbound"),
    )
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    customer = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    linkages = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['customer', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['channel', 'direction']),
            models.Index(fields=['timestamp']),
        ]


class Targets(models.Model):
    staff = models.ForeignKey(Employee, on_delete=models.CASCADE)
    period = models.CharField(max_length=20)  # e.g., YYYY-MM
    goal_calls = models.IntegerField(default=0)
    goal_visits = models.IntegerField(default=0)
    goal_bales = models.FloatField(default=0)
    goal_collections = models.FloatField(default=0)

    class Meta:
        unique_together = ("staff", "period")


# Additional PRD Models

class StaffCapability(models.Model):
    CAPABILITY_CHOICES = (
        ("TELE", "Tele-calling"),
        ("VISIT", "Physical visits"),
        ("SAMPLE", "Sample delivery"),
        ("COLLECTION", "Collections"),
    )
    
    staff = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="capabilities")
    capability_type = models.CharField(max_length=20, choices=CAPABILITY_CHOICES)
    
    class Meta:
        unique_together = ("staff", "capability_type")


class CustomerCapability(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="capabilities")
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    monthly_volume = models.FloatField(default=0)
    strength_note = models.TextField(blank=True)


class PriceList(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    effective_date = models.DateField()
    rate = models.FloatField()
    currency = models.CharField(max_length=10, default="INR")
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-effective_date']


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ("CASH", "Cash"),
        ("CHEQUE", "Cheque"),
        ("NEFT", "NEFT"),
        ("RTGS", "RTGS"),
        ("UPI", "UPI"),
    )
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    payment_date = models.DateField()
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    amount = models.FloatField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class PaymentInstrument(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("CLEARED", "Cleared"),
        ("BOUNCED", "Bounced"),
    )
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="instruments")
    instrument_no = models.CharField(max_length=100)
    bank = models.CharField(max_length=255)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")


# BusinessCalendar model moved to end of file to avoid duplication


class RateAlert(models.Model):
    DIRECTION_CHOICES = (
        ("UP", "Price Increase"),
        ("DOWN", "Price Decrease"),
    )
    
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    threshold_percent = models.FloatField()
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    effective_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)


# CityWeekdayPlan model moved to end of file to avoid duplication


class Notification(models.Model):
    CHANNEL_CHOICES = (
        ("PUSH", "Push Notification"),
        ("EMAIL", "Email"),
        ("SMS", "SMS"),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    jobcard = models.ForeignKey('JobCard', on_delete=models.SET_NULL, null=True, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# AIProcessingLog model moved to end of file to avoid duplication




class EmployeeTask(models.Model):
    """Task management for employees"""
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Task dates
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Assignment details
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='tasks_assigned')
    
    # Task completion details
    completion_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-assigned_date']
    
    def __str__(self):
        return f"{self.title} - {self.employee.admin.first_name} {self.employee.admin.last_name}"
    
    @property
    def is_overdue(self):
        if self.due_date and self.status not in ['completed', 'cancelled']:
            from django.utils import timezone
            return timezone.localdate() > self.due_date
        return False
    
    @property
    def days_until_due(self):
        if self.due_date and self.status not in ['completed', 'cancelled']:
            from django.utils import timezone
            delta = self.due_date - timezone.localdate()
            return delta.days
        return None


class JobCard(models.Model):
    """Job Card system for task assignment and tracking"""
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Basic Information
    description = models.TextField(blank=True, default='', help_text='Description of the job card task')
    
    # Type field from old model
    TYPE_CHOICES = (
        ("CALL", "Tele-calling"),
        ("VISIT", "Physical visit"),
        ("SAMPLE", "Sample delivery"),
        ("COLLECTION", "Collections"),
        ("FOLLOWUP", "Follow-up"),
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, null=True, blank=True)
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Assignment Details
    assigned_to = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, help_text='Employee assigned to this job card')
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, help_text='User who created this job card')
    
    # Dates
    created_date = models.DateTimeField(auto_now_add=True, help_text='When this job card was created')
    due_date = models.DateTimeField(null=True, blank=True, help_text='When this job card is due')
    # Note: assigned_date, started_date, completed_date don't exist in database
    # These fields are not used in the current database schema
    
    # Note: estimated_hours, actual_hours don't exist in database
    # These fields are not used in the current database schema
    
    # Location and Customer (mapped to existing fields)
    customer = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True)
    related_item = models.ForeignKey('Item', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Note: The following fields don't exist in the current database schema:
    # work_location, progress_percentage, work_notes, completion_notes, 
    # reference_documents, requires_approval, approved_by, approval_date
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_date']
        indexes = [
            models.Index(fields=['status', 'assigned_to']),
            models.Index(fields=['assigned_by', 'created_date']),
            models.Index(fields=['due_date']),
            models.Index(fields=['type', 'status']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['created_date', 'status']),
        ]
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"JC-{self.id} - {self.get_type_display() or 'Job Card'}"
    
    @property
    def job_card_number(self):
        """Generate job card number dynamically"""
        return f"JC-{self.id:04d}"
    
    @property
    def title(self):
        """Extract title from description or generate from type"""
        if self.description:
            # If description contains a title (first line), extract it
            lines = self.description.split('\n')
            first_line = lines[0].strip()
            if first_line and len(first_line) < 100:  # Reasonable title length
                return first_line
            else:
                # Fallback to truncated description
                return f"{self.description[:50]}..." if len(self.description) > 50 else self.description
        
        # Fallback to type display
        return self.get_type_display() if self.type else 'Job Card'
    
    # Note: estimated_hours_display property removed since estimated_hours doesn't exist in database
    
    @property
    def is_overdue(self):
        if self.due_date and self.status not in ['COMPLETED', 'CANCELLED']:
            from django.utils import timezone
            return timezone.now() > self.due_date
        return False
    
    @property
    def days_until_due(self):
        if self.due_date and self.status not in ['COMPLETED', 'CANCELLED']:
            from django.utils import timezone
            delta = self.due_date.date() - timezone.now().date()
            return delta.days
        return None
    
    @property
    def assigned_to_name(self):
        try:
            if self.assigned_to and hasattr(self.assigned_to, 'admin') and self.assigned_to.admin:
                first_name = getattr(self.assigned_to.admin, 'first_name', '')
                last_name = getattr(self.assigned_to.admin, 'last_name', '')
                return f"{first_name} {last_name}".strip() or "Unknown User"
        except (AttributeError, Exception):
            pass
        return "Unassigned"
    
    @property
    def assigned_by_name(self):
        try:
            if self.assigned_by:
                first_name = getattr(self.assigned_by, 'first_name', '')
                last_name = getattr(self.assigned_by, 'last_name', '')
                return f"{first_name} {last_name}".strip() or "Unknown User"
        except (AttributeError, Exception):
            pass
        return "System"
    
    @property
    def status_color(self):
        colors = {
            'PENDING': 'primary',
            'IN_PROGRESS': 'warning',
            'COMPLETED': 'success',
            'CANCELLED': 'danger',
        }
        return colors.get(self.status, 'secondary')
    
    @property
    def priority_color(self):
        colors = {
            'LOW': 'success',
            'MEDIUM': 'warning',
            'HIGH': 'danger',
        }
        return colors.get(self.priority, 'secondary')


class JobCardComment(models.Model):
    """Comments and updates on job cards"""
    job_card = models.ForeignKey(JobCard, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment on {self.job_card.job_card_number} by {self.user.first_name}"


class JobCardTimeLog(models.Model):
    """Time tracking for job cards"""
    job_card = models.ForeignKey(JobCard, on_delete=models.CASCADE, related_name='time_logs')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    hours_worked = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def save(self, *args, **kwargs):
        if self.start_time and self.end_time:
            time_diff = self.end_time - self.start_time
            self.hours_worked = round(time_diff.total_seconds() / 3600, 2)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Time log for {self.job_card.job_card_number} - {self.hours_worked}h"




# Location Tracking Models
class LocationSession(models.Model):
    """Tracks user location sessions during work hours"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='location_sessions')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=200, blank=True)
    location_address = models.CharField(max_length=500, blank=True)
    checkin_time = models.DateTimeField(auto_now_add=True)
    checkout_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.CharField(max_length=500, blank=True)
    accuracy = models.FloatField(null=True, blank=True, help_text='GPS accuracy in meters')
    
    class Meta:
        ordering = ['-checkin_time'] 
    
    @property
    def duration(self):
        """Calculate total duration of session"""
        if self.checkout_time:
            return self.checkout_time - self.checkin_time
        return None
    
    @property
    def is_current_session(self):
        """Check if this is the user's current active session"""
        return self.is_active and self.checkout_time is None
    
    def __str__(self):
        return f'{self.user.get_full_name()} - {self.location_name or "Unknown Location"}'


class WorkLocation(models.Model):
    """Defines approved work locations with geofencing"""
    name = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_meters = models.IntegerField(default=100, help_text='Geofencing radius in meters')
    address = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserStatus(models.Model):
    """Current status of users - tracks checkin state"""
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('idle', 'Idle'),
        ('offline', 'Offline'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    is_checked_in = models.BooleanField(default=False)
    current_session = models.ForeignKey(LocationSession, null=True, blank=True, on_delete=models.SET_NULL)
    status_type = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')
    last_activity = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f'{self.user.get_full_name()} - {self.status_type}'


# EmployeeGPSAttendance model moved to end of file to avoid duplication


class StaffScoresDaily(models.Model):
    """Daily staff performance scores and statistics"""
    staff = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    jobs_completed = models.IntegerField(default=0)
    orders_count = models.IntegerField(default=0)
    bales_total = models.FloatField(default=0)
    payments_count = models.IntegerField(default=0)
    points = models.FloatField(default=0)
    
    class Meta:
        unique_together = ['staff', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f'{self.staff.admin.first_name} - {self.date} ({self.points} pts)'


# ==================================================
# GPS Tracking & Attendance Models
# ==================================================

class GPSTrack(models.Model):
    """Real-time GPS tracking data for employees"""
    STATUS_CHOICES = [
        ('CHECKED_IN', 'Checked In'),
        ('CHECKED_OUT', 'Checked Out'),
        ('ON_BREAK', 'On Break'),
        ('WORKING', 'Working'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='gps_tracks')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy = models.FloatField(null=True, blank=True, help_text='GPS accuracy in meters')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WORKING')
    address = models.CharField(max_length=500, blank=True, help_text='Reverse geocoded address')
    speed = models.FloatField(null=True, blank=True, help_text='Speed in km/h')
    heading = models.FloatField(null=True, blank=True, help_text='Direction in degrees')
    battery_level = models.IntegerField(null=True, blank=True, help_text='Device battery percentage')
    is_active = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['employee', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f'{self.employee.admin.first_name} - {self.get_status_display()} at {self.timestamp.strftime("%H:%M")}'


class GPSCheckIn(models.Model):
    """GPS-based check-in/check-out records"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='gps_checkins')
    check_in_time = models.DateTimeField()
    check_in_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    check_in_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    check_in_address = models.CharField(max_length=500, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    check_out_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_out_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_out_address = models.CharField(max_length=500, blank=True)
    work_summary = models.TextField(blank=True, help_text='Employee summary of work done')
    manager_notes = models.TextField(blank=True, help_text='Manager notes on attendance')
    total_distance_km = models.FloatField(default=0)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-check_in_time']
        indexes = [
            models.Index(fields=['employee', 'check_in_time']),
            models.Index(fields=['check_in_time']),
        ]
    
    @property
    def duration_hours(self):
        if self.check_out_time:
            duration = self.check_out_time - self.check_in_time
            return round(duration.total_seconds() / 3600, 2)
        return None
    
    @property
    def status(self):
        if self.check_out_time:
            return "Completed"
        else:
            return "Active"
    
    def __str__(self):
        return f'{self.employee.admin.first_name} - {self.check_in_time.strftime("%Y-%m-%d")}'


class EmployeeGeofence(models.Model):
    """Geofenced areas for employee tracking"""
    FENCE_TYPE_CHOICES = [
        ('OFFICE', 'Office'),
        ('WORK_SITE', 'Work Site'),
        ('FIELD', 'Field Work'),
        ('CLIENT', 'Client Location'),
    ]
    
    name = models.CharField(max_length=200)
    fence_type = models.CharField(max_length=20, choices=FENCE_TYPE_CHOICES)
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_meters = models.IntegerField(default=100, help_text='Geofencing radius in meters')
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    allow_checkin = models.BooleanField(default=True)
    allow_checkout = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f'{self.name} ({self.get_fence_type_display()})'


class GPSRoute(models.Model):
    """Track employee routes and movements"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='gps_routes')
    date = models.DateField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    total_distance_km = models.FloatField(default=0)
    avg_speed_kmh = models.FloatField(default=0)
    max_speed_kmh = models.FloatField(default=0)
    stops_count = models.IntegerField(default=0)
    efficiency_score = models.FloatField(null=True, blank=True, help_text='Route efficiency score')
    route_points = models.JSONField(null=True, blank=True, help_text='Stored route coordinates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-start_time']
        unique_together = ['employee', 'date']
    
    def __str__(self):
        return f'{self.employee.admin.first_name} - {self.date}'


class GPSSession(models.Model):
    """Active GPS tracking sessions"""
    SESSION_TYPE_CHOICES = [
        ('WORK', 'Work Session'),
        ('FIELD', 'Field Session'),
        ('MEETING', 'Meeting'),
        ('TRAVEL', 'Travel'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='gps_sessions')
    session_type = models.CharField(max_length=15, choices=SESSION_TYPE_CHOICES)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    start_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    start_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    end_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    end_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    notes = models.TextField(blank=True)
    productivity_score = models.IntegerField(null=True, blank=True, help_text='Session productivity score (1-10)')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-start_time']
    
    @property
    def duration_minutes(self):
        end_time = self.end_time or timezone.now()
        duration = end_time - self.start_time
        return int(duration.total_seconds() / 60)
    
    def __str__(self):
        return f'{self.employee.admin.first_name} - {self.get_session_type_display()}'


# ==================================================
# Social Module Models - Messaging & Google Drive
# ==================================================

class ChatGroup(models.Model):
    """Chat groups for messaging - department groups and custom groups"""
    GROUP_TYPE_CHOICES = [
        ('DEPARTMENT', 'Department Group'),
        ('CUSTOM', 'Custom Group'),
        ('DIRECT', 'Direct Message'),
    ]
    
    name = models.CharField(max_length=200)
    group_type = models.CharField(max_length=15, choices=GROUP_TYPE_CHOICES)
    description = models.TextField(blank=True)
    
    # For department groups
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    
    # Group settings
    is_active = models.BooleanField(default=True)
    allow_file_sharing = models.BooleanField(default=True)
    max_members = models.IntegerField(default=100)
    
    # Metadata
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['group_type', 'is_active']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_group_type_display()})"
    
    @property
    def member_count(self):
        return self.members.filter(is_active=True).count()


class ChatGroupMember(models.Model):
    """Membership in chat groups"""
    ROLE_CHOICES = [
        ('MEMBER', 'Member'),
        ('ADMIN', 'Admin'),
        ('MODERATOR', 'Moderator'),
    ]
    
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False)
    muted_until = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['group', 'user']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['group', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} in {self.group.name}"
    
    @property
    def unread_count(self):
        if not self.last_read_at:
            return self.group.messages.count()
        return self.group.messages.filter(created_at__gt=self.last_read_at).count()


class ChatMessage(models.Model):
    """Individual chat messages"""
    MESSAGE_TYPE_CHOICES = [
        ('TEXT', 'Text Message'),
        ('IMAGE', 'Image'),
        ('FILE', 'File'),
        ('DRIVE_FILE', 'Google Drive File'),
        ('SYSTEM', 'System Message'),
    ]
    
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    message_type = models.CharField(max_length=15, choices=MESSAGE_TYPE_CHOICES, default='TEXT')
    
    # Message content
    content = models.TextField(blank=True)  # Text content
    file_attachment = models.FileField(upload_to='chat_files/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)  # Size in bytes
    
    # Google Drive integration
    drive_file_id = models.CharField(max_length=100, blank=True)
    drive_file_name = models.CharField(max_length=255, blank=True)
    drive_file_url = models.URLField(blank=True)
    
    # Message metadata
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Reply functionality
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['message_type']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.get_full_name()} in {self.group.name}"
    
    @property
    def is_file_message(self):
        return self.message_type in ['IMAGE', 'FILE', 'DRIVE_FILE']
    
    @property
    def file_extension(self):
        if self.file_name:
            return self.file_name.split('.')[-1].lower()
        return None


class ChatMessageReaction(models.Model):
    """Reactions to chat messages (like/emoji)"""
    REACTION_CHOICES = [
        ('LIKE', '👍'),
        ('LOVE', '❤️'),
        ('LAUGH', '😂'),
        ('WOW', '😮'),
        ('SAD', '😢'),
        ('ANGRY', '😠'),
    ]
    
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='message_reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user', 'reaction_type']
        indexes = [
            models.Index(fields=['message', 'reaction_type']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} {self.get_reaction_type_display()} on message"


class ChatMessageDelivery(models.Model):
    """Track message delivery and read status"""
    STATUS_CHOICES = [
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
    ]
    
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='delivery_status')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='message_deliveries')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SENT')
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['message', 'user']
        indexes = [
            models.Index(fields=['message', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"Delivery to {self.user.get_full_name()}: {self.status}"


class GoogleDriveIntegration(models.Model):
    """Google Drive OAuth integration per user"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='drive_integration')
    
    # OAuth tokens (encrypted)
    access_token = models.TextField()  # Will be encrypted
    refresh_token = models.TextField()  # Will be encrypted
    token_expires_at = models.DateTimeField()
    
    # Google account info
    google_email = models.EmailField()
    google_name = models.CharField(max_length=200)
    google_id = models.CharField(max_length=50)
    
    # Integration settings
    is_active = models.BooleanField(default=True)
    auto_sync = models.BooleanField(default=False)
    allowed_file_types = models.JSONField(default=list)  # List of allowed MIME types
    max_file_size_mb = models.IntegerField(default=100)
    
    # Audit fields
    connected_at = models.DateTimeField(auto_now_add=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_error_count = models.IntegerField(default=0)
    last_error = models.TextField(blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['google_email']),
        ]
    
    def __str__(self):
        return f"Drive integration for {self.user.get_full_name()}"
    
    @property
    def is_token_expired(self):
        return timezone.now() >= self.token_expires_at


class GoogleDriveFile(models.Model):
    """Cached Google Drive file metadata"""
    integration = models.ForeignKey(GoogleDriveIntegration, on_delete=models.CASCADE, related_name='cached_files')
    
    # Google Drive file info
    drive_file_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size = models.BigIntegerField(null=True, blank=True)
    
    # File metadata
    web_view_link = models.URLField()
    web_content_link = models.URLField(blank=True)
    thumbnail_link = models.URLField(blank=True)
    
    # Permissions
    is_public = models.BooleanField(default=False)
    can_share = models.BooleanField(default=True)
    
    # Cache metadata
    cached_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    access_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-last_accessed']
        indexes = [
            models.Index(fields=['integration', 'mime_type']),
            models.Index(fields=['drive_file_id']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.integration.user.get_full_name()})"


class SocialNotificationSettings(models.Model):
    """User notification preferences for social features"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='social_notification_settings')
    
    # Message notifications
    desktop_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=False)
    sound_notifications = models.BooleanField(default=True)
    
    # Notification timing
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    weekend_notifications = models.BooleanField(default=True)
    
    # Group-specific settings
    mute_all_groups = models.BooleanField(default=False)
    only_mentions = models.BooleanField(default=False)
    
    # Drive notifications
    drive_share_notifications = models.BooleanField(default=True)
    drive_sync_notifications = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Social notifications for {self.user.get_full_name()}"


class SocialAuditLog(models.Model):
    """Audit log for social module activities"""
    ACTION_CHOICES = [
        ('MESSAGE_SENT', 'Message Sent'),
        ('MESSAGE_DELETED', 'Message Deleted'),
        ('GROUP_CREATED', 'Group Created'),
        ('GROUP_JOINED', 'Joined Group'),
        ('GROUP_LEFT', 'Left Group'),
        ('DRIVE_CONNECTED', 'Drive Connected'),
        ('DRIVE_DISCONNECTED', 'Drive Disconnected'),
        ('FILE_SHARED', 'File Shared'),
        ('ADMIN_ACTION', 'Admin Action'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='social_audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    
    # Context
    group = models.ForeignKey(ChatGroup, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.ForeignKey(ChatMessage, on_delete=models.SET_NULL, null=True, blank=True)
    target_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='social_audit_targets')
    
    # Details
    details = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action', 'created_at']),
            models.Index(fields=['action', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_action_display()}"


# ============================================================================
# ENHANCED AI AND BUSINESS MODELS (Merged from external repository)
# ============================================================================

class AIProcessingLog(models.Model):
    """
    Track AI processing operations for field reports and other AI tasks
    """
    STATUS_CHOICES = [
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending'),
    ]
    
    # Core fields
    jobcard_action = models.ForeignKey('JobCardAction', on_delete=models.CASCADE, null=True, blank=True)
    input_text = models.TextField()
    processed_data = models.JSONField(null=True, blank=True)
    
    # Processing details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    confidence_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    processing_method = models.CharField(max_length=50, default='llm')  # llm, regex, manual
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # User context
    processed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['jobcard_action', 'status']),
        ]
    
    def __str__(self):
        return f"AI Processing {self.id} - {self.status}"


class BusinessCalendar(models.Model):
    """
    Business calendar for managing working days and holidays
    """
    date = models.DateField(unique=True)
    is_working_day = models.BooleanField(default=True)
    is_holiday = models.BooleanField(default=False)
    holiday_name = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    
    # Regional settings
    city = models.ForeignKey('City', on_delete=models.CASCADE, null=True, blank=True)
    applies_to_all = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['date']
        unique_together = ['date', 'city']
    
    def __str__(self):
        return f"{self.date} - {'Holiday' if self.is_holiday else 'Working Day'}"


class CityWeekdayPlan(models.Model):
    """
    Define working days for each city
    """
    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    city = models.ForeignKey('City', on_delete=models.CASCADE)
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    is_working_day = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['city', 'weekday']
        ordering = ['city', 'weekday']
    
    def __str__(self):
        return f"{self.city.name} - {self.get_weekday_display()}"


# Enhanced JobCardAction model to include structured JSON data
# Note: This adds a field to the existing JobCardAction model
# The migration will handle adding this field safely

def add_structured_json_to_jobcard_action():
    """
    Function to add structured_json field to JobCardAction model
    This will be handled in a migration
    """
    pass


# ============================================================================
# ENHANCED GPS AND LOCATION MODELS
# ============================================================================

class GPSGeofence(models.Model):
    """
    Define geographical boundaries for attendance and location tracking
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Geofence coordinates (can be circle or polygon)
    center_latitude = models.DecimalField(max_digits=10, decimal_places=8)
    center_longitude = models.DecimalField(max_digits=11, decimal_places=8)
    radius_meters = models.PositiveIntegerField(default=100)  # For circular geofences
    
    # Polygon coordinates (JSON format for complex shapes)
    polygon_coordinates = models.JSONField(null=True, blank=True)
    
    # Associated entities
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, null=True, blank=True)
    city = models.ForeignKey('City', on_delete=models.CASCADE, null=True, blank=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    allow_attendance = models.BooleanField(default=True)
    require_photo = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"Geofence: {self.name}"


class GPSLocationHistory(models.Model):
    """
    Track detailed GPS location history for employees
    """
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Location data
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    accuracy = models.FloatField(null=True, blank=True)  # GPS accuracy in meters
    altitude = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)  # Speed in m/s
    
    # Context
    activity_type = models.CharField(max_length=50, blank=True)  # walking, driving, stationary
    battery_level = models.IntegerField(null=True, blank=True)
    network_type = models.CharField(max_length=20, blank=True)  # wifi, mobile, gps
    
    # Associated records
    jobcard = models.ForeignKey('JobCard', on_delete=models.SET_NULL, null=True, blank=True)
    geofence = models.ForeignKey(GPSGeofence, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    recorded_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['employee', 'recorded_at']),
            models.Index(fields=['jobcard', 'recorded_at']),
        ]
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.recorded_at}"


# EmployeeGPSAttendance model already defined above - removing duplicate


class EmployeeLocationSession(models.Model):
    """
    Track employee location sessions and movement patterns
    """
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Session data
    session_start = models.DateTimeField()
    session_end = models.DateTimeField(null=True, blank=True)
    
    # Location summary
    start_latitude = models.DecimalField(max_digits=10, decimal_places=8)
    start_longitude = models.DecimalField(max_digits=11, decimal_places=8)
    end_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    end_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Session statistics
    total_distance = models.FloatField(default=0.0)  # Total distance in km
    max_speed = models.FloatField(null=True, blank=True)  # Max speed in km/h
    avg_speed = models.FloatField(null=True, blank=True)  # Average speed in km/h
    location_points_count = models.PositiveIntegerField(default=0)
    
    # Context
    primary_activity = models.CharField(max_length=50, blank=True)
    jobcards_visited = models.ManyToManyField('JobCard', blank=True)
    customers_visited = models.ManyToManyField('Customer', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-session_start']
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - Session {self.session_start.date()}"
