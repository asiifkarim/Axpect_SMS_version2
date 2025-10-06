from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.conf import settings
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup production environment with initial data and configurations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-email',
            type=str,
            default='admin@axpecttech.com',
            help='Admin user email address'
        )
        parser.add_argument(
            '--admin-password',
            type=str,
            default='admin123',
            help='Admin user password'
        )
        parser.add_argument(
            '--skip-superuser',
            action='store_true',
            help='Skip superuser creation'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Setting up production environment...'))

        # Run migrations
        self.stdout.write('📊 Running database migrations...')
        call_command('migrate', verbosity=0)
        self.stdout.write(self.style.SUCCESS('✅ Migrations completed'))

        # Create superuser if needed
        if not options['skip_superuser']:
            if not User.objects.filter(is_superuser=True).exists():
                self.stdout.write('👤 Creating superuser...')
                User.objects.create_superuser(
                    email=options['admin_email'],
                    password=options['admin_password'],
                    first_name='Admin',
                    last_name='User'
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Superuser created: {options["admin_email"]}')
                )
            else:
                self.stdout.write('👤 Superuser already exists')

        # Collect static files
        self.stdout.write('📦 Collecting static files...')
        call_command('collectstatic', verbosity=0, interactive=False)
        self.stdout.write(self.style.SUCCESS('✅ Static files collected'))

        # Create necessary directories
        directories = ['logs', 'media', 'backups']
        for directory in directories:
            dir_path = os.path.join(settings.BASE_DIR, directory)
            os.makedirs(dir_path, exist_ok=True)
            self.stdout.write(f'📁 Created directory: {directory}')

        # Check Redis connection
        try:
            from django.core.cache import cache
            cache.set('health_check', 'ok', 30)
            if cache.get('health_check') == 'ok':
                self.stdout.write(self.style.SUCCESS('✅ Redis connection successful'))
            else:
                self.stdout.write(self.style.WARNING('⚠️ Redis connection issue'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Redis connection failed: {e}'))

        # Check database connection
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                self.stdout.write(self.style.SUCCESS('✅ Database connection successful'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Database connection failed: {e}'))

        self.stdout.write(self.style.SUCCESS('\n🎉 Production setup completed!'))
        self.stdout.write('\n📋 Next steps:')
        self.stdout.write('1. Configure your domain in ALLOWED_HOSTS')
        self.stdout.write('2. Set up SSL certificates')
        self.stdout.write('3. Configure monitoring alerts')
        self.stdout.write('4. Set up automated backups')
