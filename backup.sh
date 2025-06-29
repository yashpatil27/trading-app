#!/bin/bash

# Trading App Database Backup/Restore Utility

case "$1" in
  "backup")
    echo "🔄 Creating database backup..."
    npx tsx scripts/backup-database.ts "$2"
    ;;
  "restore")
    echo "🔄 Restoring database..."
    npx tsx scripts/restore-database.ts restore "$2"
    ;;
  "list")
    echo "📁 Listing available backups..."
    npx tsx scripts/restore-database.ts list
    ;;
  "auto")
    echo "🔄 Running automatic backup..."
    npx tsx scripts/auto-backup.ts
    ;;
  *)
    echo "Trading App Database Backup/Restore Utility"
    echo ""
    echo "Usage:"
    echo "  ./backup.sh backup [description]     - Create a new backup"
    echo "  ./backup.sh restore [filename]       - Restore from backup"
    echo "  ./backup.sh list                     - List all backups"
    echo "  ./backup.sh auto                     - Auto backup with cleanup"
    echo ""
    echo "Examples:"
    echo "  ./backup.sh backup \"before-migration\""
    echo "  ./backup.sh restore backup_2025-06-28T14-20-00-000Z.db"
    echo "  ./backup.sh restore                  (uses most recent backup)"
    ;;
esac
