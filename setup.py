#!/usr/bin/env python
"""
Setup script for Axpect SMS
"""

import os
import sys
import subprocess
import django
from django.core.management import execute_from_command_line

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def setup_environment():
    """Set up the development environment"""
    print("🚀 Setting up Axpect SMS Development Environment")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Create virtual environment
    if not os.path.exists('venv'):
        if not run_command('python -m venv venv', 'Creating virtual environment'):
            return False
    else:
        print("✅ Virtual environment already exists")
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_cmd = 'venv\\Scripts\\activate'
        pip_cmd = 'venv\\Scripts\\pip'
    else:  # Unix/Linux/Mac
        activate_cmd = 'source venv/bin/activate'
        pip_cmd = 'venv/bin/pip'
    
    # Install requirements
    if not run_command(f'{pip_cmd} install --upgrade pip', 'Upgrading pip'):
        return False
    
    if not run_command(f'{pip_cmd} install -r requirements.txt', 'Installing dependencies'):
        return False
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'axpect_tech_config.settings')
    django.setup()
    
    # Run migrations
    if not run_command(f'{pip_cmd} run python manage.py makemigrations', 'Creating migrations'):
        return False
    
    if not run_command(f'{pip_cmd} run python manage.py migrate', 'Running migrations'):
        return False
    
    # Create superuser
    print("\n🔄 Creating superuser...")
    print("You'll need to create a superuser account.")
    print("Run: python manage.py createsuperuser")
    
    # Collect static files
    if not run_command(f'{pip_cmd} run python manage.py collectstatic --noinput', 'Collecting static files'):
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Activate virtual environment:")
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("2. Create superuser: python manage.py createsuperuser")
    print("3. Start development server: python manage.py runserver")
    print("4. Start Celery worker: celery -A axpect_tech_config worker --loglevel=info")
    print("5. Start Celery beat: celery -A axpect_tech_config beat --loglevel=info")
    
    return True

if __name__ == '__main__':
    setup_environment()
