from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import redis
import requests
import os

class Command(BaseCommand):
    help = 'Comprehensive health check for production environment'

    def add_arguments(self, parser):
        parser.add_argument(
            '--detailed',
            action='store_true',
            help='Show detailed health information'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🏥 Running health checks...'))
        
        all_healthy = True
        
        # Database check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                self.stdout.write(self.style.SUCCESS('✅ Database: Healthy'))
                if options['detailed']:
                    self.stdout.write(f'   Engine: {settings.DATABASES["default"]["ENGINE"]}')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Database: Failed - {e}'))
            all_healthy = False

        # Redis/Cache check
        try:
            cache.set('health_check', 'ok', 30)
            if cache.get('health_check') == 'ok':
                self.stdout.write(self.style.SUCCESS('✅ Redis/Cache: Healthy'))
                if options['detailed']:
                    cache_config = settings.CACHES['default']
                    self.stdout.write(f'   Backend: {cache_config["BACKEND"]}')
                    self.stdout.write(f'   Location: {cache_config["LOCATION"]}')
            else:
                raise Exception("Cache test failed")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Redis/Cache: Failed - {e}'))
            all_healthy = False

        # Celery broker check
        try:
            import celery
            from axpect_tech_config.celery import app
            inspect = app.control.inspect()
            stats = inspect.stats()
            if stats:
                self.stdout.write(self.style.SUCCESS('✅ Celery: Healthy'))
                if options['detailed']:
                    active_workers = len(stats.keys())
                    self.stdout.write(f'   Active workers: {active_workers}')
            else:
                raise Exception("No active workers")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️ Celery: Warning - {e}'))

        # Disk space check
        try:
            import shutil
            total, used, free = shutil.disk_usage(settings.BASE_DIR)
            free_percent = (free / total) * 100
            if free_percent > 10:
                self.stdout.write(self.style.SUCCESS(f'✅ Disk Space: Healthy ({free_percent:.1f}% free)'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ Disk Space: Low ({free_percent:.1f}% free)'))
                if free_percent < 5:
                    all_healthy = False
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Disk Space: Failed - {e}'))

        # Memory check
        try:
            import psutil
            memory = psutil.virtual_memory()
            if memory.percent < 90:
                self.stdout.write(self.style.SUCCESS(f'✅ Memory: Healthy ({memory.percent:.1f}% used)'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ Memory: High usage ({memory.percent:.1f}% used)'))
                if memory.percent > 95:
                    all_healthy = False
        except ImportError:
            self.stdout.write(self.style.WARNING('⚠️ Memory: psutil not installed, skipping'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Memory: Failed - {e}'))

        # AI Services check
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            try:
                # Simple API key validation (without making actual API calls)
                if len(settings.OPENAI_API_KEY) > 20:
                    self.stdout.write(self.style.SUCCESS('✅ OpenAI API: Key configured'))
                else:
                    self.stdout.write(self.style.WARNING('⚠️ OpenAI API: Key seems invalid'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠️ OpenAI API: {e}'))

        if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
            try:
                if len(settings.GEMINI_API_KEY) > 20:
                    self.stdout.write(self.style.SUCCESS('✅ Gemini API: Key configured'))
                else:
                    self.stdout.write(self.style.WARNING('⚠️ Gemini API: Key seems invalid'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠️ Gemini API: {e}'))

        # Log files check
        log_dir = os.path.join(settings.BASE_DIR, 'logs')
        if os.path.exists(log_dir):
            log_files = os.listdir(log_dir)
            if log_files:
                self.stdout.write(self.style.SUCCESS(f'✅ Logging: {len(log_files)} log files'))
                if options['detailed']:
                    for log_file in log_files[:3]:  # Show first 3 files
                        file_path = os.path.join(log_dir, log_file)
                        size = os.path.getsize(file_path) / 1024 / 1024  # MB
                        self.stdout.write(f'   {log_file}: {size:.1f}MB')
            else:
                self.stdout.write(self.style.WARNING('⚠️ Logging: No log files found'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Logging: Log directory not found'))

        # Overall status
        self.stdout.write('\n' + '='*50)
        if all_healthy:
            self.stdout.write(self.style.SUCCESS('🎉 Overall Status: HEALTHY'))
            exit_code = 0
        else:
            self.stdout.write(self.style.ERROR('💥 Overall Status: UNHEALTHY'))
            exit_code = 1

        if options['detailed']:
            self.stdout.write(f'\nEnvironment: {"Production" if not settings.DEBUG else "Development"}')
            self.stdout.write(f'Django Version: {settings.DJANGO_VERSION if hasattr(settings, "DJANGO_VERSION") else "Unknown"}')
            self.stdout.write(f'Debug Mode: {settings.DEBUG}')

        return exit_code
