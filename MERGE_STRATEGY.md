# 🔀 Code Merge Strategy for Axpect SMS

## Overview

This document outlines the strategy for merging external code repositories with the production-ready Axpect SMS Django Staff Management System.

## 🏗️ Current System Architecture

### Core Components
- **Django 4.2+** with ASGI (Daphne)
- **AI Chatbot** (`/ai/` app) with OpenAI/Gemini integration
- **PostgreSQL** database with Redis caching
- **Celery** task queues with multiple priorities
- **Production Security** hardening
- **Monitoring Stack** (Prometheus, Grafana, Sentry)

### Key Apps Structure
```
axpect_sms/
├── main_app/          # Core user management
├── api/               # REST API endpoints
├── social/            # Social features with WebSockets
├── ai/                # AI chatbot integration
├── axpect_tech_config/ # Django configuration
└── services/          # External service integrations
```

## 🔍 Pre-Merge Analysis

### Step 1: Repository Analysis

Before merging, analyze the external repository:

```bash
# Clone the external repository
git clone <external-repo-url> external_repo
cd external_repo

# Analyze structure
find . -name "*.py" | head -20
find . -name "requirements*.txt"
find . -name "settings*.py"
find . -name "models.py"
find . -name "views.py"
```

### Step 2: Dependency Analysis

Create a dependency comparison:

```bash
# Compare requirements
diff requirements.txt ../external_repo/requirements.txt > dependency_diff.txt

# Check Django versions
grep -i django requirements.txt
grep -i django ../external_repo/requirements.txt
```

### Step 3: Database Schema Analysis

```bash
# Check for migrations
find ../external_repo -name "migrations" -type d
find ../external_repo -name "*.py" -path "*/migrations/*" | wc -l

# Look for model definitions
find ../external_repo -name "models.py" -exec grep -l "class.*Model" {} \;
```

## 🛠️ Merge Strategies

### Strategy 1: App-Level Integration (Recommended)

**Best for**: When external code is a separate Django app

```bash
# 1. Copy the external app
cp -r ../external_repo/app_name ./new_app_name/

# 2. Update settings
# Add to INSTALLED_APPS in settings.py

# 3. Handle URL routing
# Add to main urls.py

# 4. Merge requirements
# Combine and resolve conflicts
```

### Strategy 2: Feature Integration

**Best for**: When merging specific features

```bash
# 1. Identify feature components
# - Models
# - Views
# - Templates
# - Static files
# - URLs

# 2. Integrate systematically
# - Add models to existing apps
# - Merge views and URLs
# - Combine templates
# - Update static files
```

### Strategy 3: Service Integration

**Best for**: When external code provides services

```bash
# 1. Create new service module
mkdir services/external_service/

# 2. Adapt to current architecture
# - Use existing database connections
# - Integrate with current auth system
# - Use existing caching layer
```

## 🔧 Merge Tools and Scripts

### Automated Conflict Detection

```python
# merge_analyzer.py
import os
import difflib
from pathlib import Path

def analyze_conflicts(current_path, external_path):
    """Analyze potential conflicts between codebases"""
    conflicts = []
    
    # Check for file conflicts
    current_files = set(Path(current_path).rglob("*.py"))
    external_files = set(Path(external_path).rglob("*.py"))
    
    # Find common file names
    current_names = {f.name for f in current_files}
    external_names = {f.name for f in external_files}
    common_names = current_names.intersection(external_names)
    
    return common_names

# Usage
conflicts = analyze_conflicts(".", "../external_repo")
print(f"Potential file conflicts: {conflicts}")
```

### Database Migration Strategy

```python
# migration_merger.py
def merge_migrations():
    """Strategy for merging database migrations"""
    steps = [
        "1. Backup current database",
        "2. Create migration branch",
        "3. Apply external migrations to test DB",
        "4. Resolve schema conflicts",
        "5. Create unified migration",
        "6. Test migration rollback"
    ]
    return steps
```

## 🚨 Critical Merge Considerations

### 1. Django Settings Conflicts

**Current Settings Features:**
- Production security hardening
- Multi-database Redis configuration
- ASGI with Daphne
- Comprehensive middleware stack
- AI chatbot configuration

**Merge Strategy:**
```python
# Create settings merger
def merge_settings(current_settings, external_settings):
    # Preserve production configurations
    # Merge INSTALLED_APPS carefully
    # Combine middleware without conflicts
    # Merge URL patterns
    pass
```

### 2. Database Model Conflicts

**Potential Issues:**
- Conflicting model names
- Foreign key relationships
- Migration dependencies
- Custom user model conflicts

**Resolution:**
```python
# Model conflict resolver
def resolve_model_conflicts():
    # Rename conflicting models
    # Update foreign key references
    # Create bridge models if needed
    # Maintain data integrity
    pass
```

### 3. URL Pattern Conflicts

**Current URL Structure:**
```python
urlpatterns = [
    path("", include('main_app.urls')),
    path("api/", include('api.urls')),
    path("social/", include('social.urls')),
    path("chatbot/", include('ai.urls')),
    path("health/", include('health_check.urls')),
    path("metrics/", include('django_prometheus.urls')),
]
```

### 4. Static Files and Templates

**Merge Strategy:**
- Namespace templates to avoid conflicts
- Combine static files with proper organization
- Update template inheritance chains
- Resolve CSS/JS conflicts

## 📋 Merge Checklist

### Pre-Merge
- [ ] Backup current production database
- [ ] Create merge branch: `git checkout -b merge-external-repo`
- [ ] Document current system state
- [ ] Analyze external repository structure
- [ ] Identify potential conflicts
- [ ] Plan integration strategy

### During Merge
- [ ] Copy external code to appropriate locations
- [ ] Resolve dependency conflicts
- [ ] Update Django settings
- [ ] Merge URL patterns
- [ ] Handle database migrations
- [ ] Resolve template conflicts
- [ ] Update static files
- [ ] Test AI chatbot integration
- [ ] Verify security configurations

### Post-Merge Testing
- [ ] Run all tests: `python manage.py test`
- [ ] Check health endpoints: `python manage.py health_check`
- [ ] Test AI chatbot functionality
- [ ] Verify API endpoints
- [ ] Test WebSocket connections
- [ ] Run performance tests
- [ ] Check monitoring dashboards
- [ ] Verify production deployment

### Production Deployment
- [ ] Test in staging environment
- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Deploy with zero downtime
- [ ] Monitor system health
- [ ] Verify all features working

## 🔄 Rollback Strategy

### Immediate Rollback
```bash
# If issues detected immediately
git checkout main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Database Rollback
```bash
# Restore from backup
./scripts/restore_backup.sh backup_file.sql.gz
```

### Gradual Rollback
```bash
# Feature flags for gradual rollback
# Disable new features via environment variables
# Monitor system stability
# Roll back incrementally
```

## 📞 Support During Merge

### Monitoring
- Watch Grafana dashboards for performance impact
- Monitor Sentry for new errors
- Check health endpoints regularly
- Monitor AI chatbot response times

### Testing Endpoints
```bash
# Health check
curl http://localhost/health/

# AI chatbot test
curl -X POST http://localhost/api/chatbot/ \
  -H "Content-Type: application/json" \
  -d '{"message": "test integration"}'

# API endpoints
curl http://localhost/api/

# WebSocket test (if applicable)
# Test social features
```

## 🎯 Success Criteria

### Technical Success
- [ ] All tests passing
- [ ] No performance degradation
- [ ] AI chatbot fully functional
- [ ] Security measures intact
- [ ] Monitoring systems operational

### Business Success
- [ ] All existing features working
- [ ] New features integrated successfully
- [ ] User experience maintained
- [ ] System stability confirmed
- [ ] Production deployment successful

## 📝 Documentation Updates

After successful merge:
- [ ] Update PRODUCTION_DEPLOYMENT_GUIDE.md
- [ ] Update API documentation
- [ ] Update user guides
- [ ] Document new features
- [ ] Update troubleshooting guides

---

**Next Steps**: Please provide details about the external repository you want to merge, including:
1. Repository URL or structure
2. Main functionality/purpose
3. Django version and dependencies
4. Database models and migrations
5. Any specific integration requirements
