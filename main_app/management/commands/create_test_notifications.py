"""
Management command to create test notifications for testing the notification system
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from main_app.models import NotificationManager, NotificationEmployee, Manager, Employee

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test notifications for testing the notification system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-type',
            type=str,
            choices=['manager', 'employee', 'all'],
            default='all',
            help='Create notifications for specific user type'
        )
        parser.add_argument(
            '--count',
            type=int,
            default=3,
            help='Number of test notifications to create'
        )

    def handle(self, *args, **options):
        user_type = options['user_type']
        count = options['count']

        self.stdout.write(
            self.style.SUCCESS(f'Creating {count} test notifications for {user_type}...')
        )

        created_count = 0

        if user_type in ['manager', 'all']:
            # Create notifications for managers
            managers = Manager.objects.all()[:5]  # Limit to first 5 managers
            
            for manager in managers:
                for i in range(count):
                    NotificationManager.objects.create(
                        manager=manager,
                        message=f'Test notification {i+1} for manager {manager.admin.get_full_name()}: You have a new job card assignment pending review.'
                    )
                    created_count += 1

        if user_type in ['employee', 'all']:
            # Create notifications for employees
            employees = Employee.objects.all()[:5]  # Limit to first 5 employees
            
            for employee in employees:
                for i in range(count):
                    NotificationEmployee.objects.create(
                        employee=employee,
                        message=f'Test notification {i+1} for employee {employee.admin.get_full_name()}: You have been assigned a new job card.'
                    )
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} test notifications!')
        )
        
        self.stdout.write(
            self.style.WARNING('Note: These are test notifications. You can delete them from the admin panel or database.')
        )
