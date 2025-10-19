@echo off
echo 🚀 Setting up Axpect SMS Development Environment
echo ================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

echo ✅ Python detected

REM Create virtual environment
if not exist "venv" (
    echo 🔄 Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment and install dependencies
echo 🔄 Installing dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Run Django setup
echo 🔄 Setting up Django...
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

if errorlevel 1 (
    echo ❌ Django setup failed
    pause
    exit /b 1
)

echo ✅ Django setup completed

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Activate virtual environment: venv\Scripts\activate
echo 2. Create superuser: python manage.py createsuperuser
echo 3. Start development server: python manage.py runserver
echo 4. Start Celery worker: celery -A axpect_tech_config worker --loglevel=info
echo 5. Start Celery beat: celery -A axpect_tech_config beat --loglevel=info
echo.
pause
