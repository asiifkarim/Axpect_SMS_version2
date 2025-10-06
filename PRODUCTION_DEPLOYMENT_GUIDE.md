# 🚀 Axpect SMS - Production Deployment Guide

## Overview

This guide will help you deploy the Axpect SMS Django Staff Management System to production using Docker, Daphne (ASGI), and comprehensive monitoring.

## 🏗️ Architecture

- **Web Server**: Daphne (ASGI) with Nginx reverse proxy
- **Database**: PostgreSQL with connection pooling
- **Cache/Queue**: Redis (multiple databases for different purposes)
- **Task Queue**: Celery with Celery Beat
- **Monitoring**: Prometheus + Grafana + Sentry
- **AI Integration**: OpenAI GPT / Google Gemini APIs

## 📋 Prerequisites

- Docker and Docker Compose
- Domain name (for production)
- SSL certificates (recommended)
- Email account for notifications
- AI API keys (OpenAI/Gemini)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd axpect_sms
```

### 2. Environment Configuration

```bash
# Copy production environment template
cp .env.production .env

# Edit the .env file with your actual values
nano .env
```

**Required Environment Variables:**
```bash
SECRET_KEY=your-super-secret-production-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:password@db:5432/axpect_sms
POSTGRES_PASSWORD=your-secure-password
EMAIL_ADDRESS=your-email@domain.com
EMAIL_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-key  # or OPENAI_API_KEY
```

### 3. Deploy with Docker

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### 4. Manual Deployment Steps

If you prefer manual deployment:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec web python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec web python manage.py setup_production

# Collect static files
docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput
```

## 🔧 Configuration Details

### Database Configuration

The system supports both SQLite (development) and PostgreSQL (production):

```python
# Automatic database selection based on environment
if DATABASE_URL and not DATABASE_URL.startswith("postgres://USER:PASSWORD"):
    # Use PostgreSQL in production
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL)}
else:
    # Fallback to SQLite for development
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", ...}}
```

### Redis Configuration

Multiple Redis databases for different purposes:
- **Database 0**: Celery broker
- **Database 1**: Channels (WebSockets)
- **Database 2**: Django cache
- **Database 3**: Django Defender (security)

### ASGI with Daphne

Production-optimized ASGI configuration:

```python
# asgi.py
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})
```

## 🛡️ Security Features

### Built-in Security

- **HTTPS enforcement** in production
- **HSTS headers** with preload
- **XSS protection** headers
- **CSRF protection** with secure cookies
- **Content Security Policy**
- **Brute force protection** (Django Defender)
- **Rate limiting** on API endpoints

### Security Middleware Stack

```python
MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'defender.middleware.FailedLoginMiddleware',
    # ... other middleware
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]
```

## 📊 Monitoring & Logging

### Health Checks

```bash
# Run comprehensive health check
docker-compose -f docker-compose.prod.yml exec web python manage.py health_check --detailed

# Access health endpoint
curl http://localhost/health/
```

### Monitoring Stack

- **Prometheus**: Metrics collection (`http://localhost:9090`)
- **Grafana**: Dashboards (`http://localhost:3000`)
- **Sentry**: Error tracking (configure SENTRY_DSN)
- **Django Health Check**: System health monitoring

### Logging

Structured JSON logging with rotation:
- **Console**: Development-friendly format
- **File**: JSON format with 15MB rotation
- **Sentry**: Error aggregation and alerting

## 🤖 AI Chatbot Features

The integrated AI chatbot supports:

### Supported Operations
- **Task Management**: Create, assign, and track tasks
- **Attendance Tracking**: Check records and generate reports
- **Employee Information**: View details and team info
- **Natural Language**: Commands like "Assign a task to John"

### API Configuration
```bash
# Choose your AI provider
AI_MODEL=gemini  # or 'openai'

# Configure API keys
GEMINI_API_KEY=your-key-here
# OR
OPENAI_API_KEY=your-key-here
```

### Access Points
- **Web Interface**: `/chatbot/`
- **API Endpoints**: `/api/chatbot/`
- **WebSocket**: Real-time chat support

## 🔄 Performance Optimization

### Caching Strategy

- **ORM Caching**: Cachalot for database query caching
- **Session Caching**: Redis-backed sessions
- **Static Files**: WhiteNoise with compression
- **Template Caching**: Production template caching

### Database Optimization

```python
# Connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['OPTIONS'] = {
    'MAX_CONNS': 20,
    'MIN_CONNS': 5,
}
```

### Performance Testing

```bash
# Run performance tests
docker-compose -f docker-compose.prod.yml exec web python manage.py performance_test --requests 1000 --concurrent 20
```

## 🔧 Management Commands

### Production Setup
```bash
python manage.py setup_production --admin-email admin@yourdomain.com
```

### Health Monitoring
```bash
python manage.py health_check --detailed
```

### Performance Testing
```bash
python manage.py performance_test --requests 100 --concurrent 10 --endpoint /api/
```

## 📦 Backup & Recovery

### Automated Backups

```bash
# Run backup script
./scripts/backup.sh

# Backups are stored in ./backups/
# - Database: db_backup_YYYYMMDD_HHMMSS.sql.gz
# - Media: media_backup_YYYYMMDD_HHMMSS.tar.gz
```

### Restore from Backup

```bash
# Restore database
gunzip backups/db_backup_20231201_120000.sql.gz
docker-compose -f docker-compose.prod.yml exec -T db psql -U axpect_user -d axpect_sms < backups/db_backup_20231201_120000.sql

# Restore media files
tar -xzf backups/media_backup_20231201_120000.tar.gz
```

## 🌐 Domain & SSL Setup

### Nginx Configuration

The included `nginx.conf` provides:
- **SSL termination**
- **Static file serving**
- **WebSocket proxying**
- **Rate limiting**
- **Security headers**

### SSL Certificate Setup

```bash
# Create SSL directory
mkdir ssl

# Copy your certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Update nginx configuration for HTTPS
# Edit nginx.conf to enable SSL block
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml logs db
   
   # Verify environment variables
   docker-compose -f docker-compose.prod.yml exec web env | grep DATABASE
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   docker-compose -f docker-compose.prod.yml logs redis
   
   # Test Redis connection
   docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
   ```

3. **Static Files Not Loading**
   ```bash
   # Collect static files
   docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput
   
   # Check Nginx logs
   docker-compose -f docker-compose.prod.yml logs nginx
   ```

4. **AI Chatbot Not Working**
   ```bash
   # Check API keys
   docker-compose -f docker-compose.prod.yml exec web python manage.py shell -c "
   from django.conf import settings
   print('OpenAI Key:', bool(settings.OPENAI_API_KEY))
   print('Gemini Key:', bool(settings.GEMINI_API_KEY))
   print('AI Model:', settings.AI_MODEL)
   "
   ```

### Log Analysis

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f web

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f celery
docker-compose -f docker-compose.prod.yml logs -f nginx

# Check Django logs
tail -f logs/django.log
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Add multiple web containers
2. **Database**: Consider read replicas for high traffic
3. **Redis Cluster**: For high availability
4. **CDN**: For static file delivery

### Vertical Scaling

```yaml
# docker-compose.prod.yml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 🔐 Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable HTTPS with valid certificates
- [ ] Set up Sentry for error monitoring
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] API rate limiting enabled
- [ ] Strong passwords for all accounts

## 📞 Support

For issues and support:
1. Check the troubleshooting section
2. Review application logs
3. Run health checks
4. Check monitoring dashboards

## 🎉 Success!

Your Axpect SMS system is now production-ready with:
- ✅ ASGI deployment with Daphne
- ✅ Comprehensive monitoring
- ✅ AI-powered chatbot
- ✅ Security hardening
- ✅ Performance optimization
- ✅ Automated backups
- ✅ Health monitoring

Access your application at your configured domain and start managing your staff efficiently!
