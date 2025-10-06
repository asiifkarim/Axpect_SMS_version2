#!/bin/bash

# Database backup script for production

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="axpect_sms"
DB_USER="axpect_user"

echo "🗄️ Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress the backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Create media backup
echo "📁 Backing up media files..."
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz media/

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "media_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
echo "✅ Media backup: $BACKUP_DIR/media_backup_$DATE.tar.gz"
