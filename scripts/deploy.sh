#!/bin/bash

# Production deployment script for Axpect SMS Django Application

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.production to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("SECRET_KEY" "POSTGRES_PASSWORD" "ALLOWED_HOSTS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🗄️ Starting database and Redis..."
docker-compose -f docker-compose.prod.yml up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate

echo "👤 Creating superuser (if needed)..."
docker-compose -f docker-compose.prod.yml run --rm web python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

echo "📦 Collecting static files..."
docker-compose -f docker-compose.prod.yml run --rm web python manage.py collectstatic --noinput

echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "🔍 Checking service health..."
sleep 15

# Health check
if curl -f http://localhost/health/ > /dev/null 2>&1; then
    echo "✅ Application is healthy and running!"
    echo "🌐 Access your application at: http://localhost"
    echo "📊 Grafana dashboard: http://localhost:3000 (admin/password from .env)"
    echo "📈 Prometheus metrics: http://localhost:9090"
else
    echo "❌ Health check failed. Check logs:"
    docker-compose -f docker-compose.prod.yml logs web
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain and SSL certificates"
echo "2. Set up proper backup procedures"
echo "3. Configure monitoring alerts"
echo "4. Review security settings"
